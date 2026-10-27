/**
 * `dev` 서버. 세션에 가짜 컴파일러를 주입해 esbuild 없이 HTTP 동작과 굽기 큐를 판정한다. 포트는
 * 언제나 0 이다.
 *
 * 고정하는 것은 셋이다. **요청은 자기가 온 뒤 시작한 굽기만 받는다**(고친 뒤 리로드했는데 고치기
 * 전 번들이 오지 않는다) · **실패는 기기와 터미널에 그대로 보이고 서버는 산다** · **hot 요청은 줄 것이
 * 생길 때까지 붙들렸다가 그 굽기의 응답을 받는다.**
 */
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import type { PassResult } from '../src/cli/dev/modules'
import { createDevSession, createLatestQueue } from '../src/cli/dev/session'
import type { Boot } from '../src/cli/dev/wire'
import { type DevServer, parseDevArgs, startDev, startDevServer } from '../src/cli/dev-command'

const here = dirname(fileURLToPath(import.meta.url))
const servers: DevServer[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()))
})

/** n 번째 굽기. 엔트리 모듈 몸통에 번호를 남겨 어느 굽기를 받았는지 본문에서 읽는다 */
const build = (n: number): PassResult => ({
  ok: true,
  modules: new Map([['./index.ts', { source: '', code: `/* build #${n} */` }]]),
  requires: [],
})

/** 굽기를 테스트가 손으로 끝낸다. 불린 횟수가 곧 굽기 횟수다 */
function heldCompile() {
  const calls: { resolve: (result: PassResult) => void }[] = []
  const compile = () => new Promise<PassResult>((resolve) => calls.push({ resolve }))
  return { compile, calls }
}

async function serve(compile: () => Promise<PassResult>, holdMs?: number) {
  const lines: string[] = []
  const server = await startDevServer({
    name: 'settings',
    session: createDevSession({
      name: 'settings',
      entry: './index.ts',
      epoch: 'test',
      compile,
      runtime: async () => '/* runtime */',
      log: () => {},
    }),
    port: 0,
    log: (line) => lines.push(line),
    holdMs,
  })
  servers.push(server)
  return { url: server.url, lines }
}

/** 번들 본문에 실린 부팅 값 */
const bootOf = (body: string): Boot =>
  JSON.parse(body.match(/bootDevRemote\((.*), globalThis\);/)?.[1] ?? 'null')

const hotUrl = (url: string, query: string) => new URL(`/settings/hot?${query}`, url)

/** 본문이 어느 굽기에서 왔는가 */
const buildOf = (body: string) => body.match(/\/\* build #(\d+) \*\//)?.[0]

async function until(condition: () => boolean, what: string) {
  const deadline = Date.now() + 2000
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`2초를 기다려도 오지 않았다: ${what}`)
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

test('구운 번들을 200 application/javascript 로, 캐시 없이 내준다', async () => {
  let compiled = 0
  const { url, lines } = await serve(async () => build(++compiled))

  const response = await fetch(url)

  assert.match(url, /^http:\/\/localhost:\d+\/settings\/index\.bundle\.js$/)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'application/javascript')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const body = await response.text()
  assert.ok(body.startsWith('/* runtime */\n'), '번들이 기기 런타임으로 시작하지 않는다')
  assert.equal(buildOf(body), '/* build #1 */')
  assert.match(lines[0], /^GET \/settings\/index\.bundle\.js 200 · \d+\.\d s · \d+\.\d kB · v1$/)
})

test('놀던 서버에 두 요청이 같이 와도 둘 다 자기가 온 뒤 시작한 굽기를 받는다. 굽기는 둘이다', async () => {
  // iOS 와 Android 를 같이 리로드한 모양이다. 뒤 요청이 앞 굽기를 받으면 그사이 고친 것이 빠진다
  let started = 0
  const { url } = await serve(async () => {
    const n = ++started
    await new Promise((resolve) => setTimeout(resolve, 30))
    return build(n)
  })

  const bodies = await Promise.all([fetch(url), fetch(url)].map(async (r) => (await r).text()))

  assert.equal(started, 2)
  assert.deepEqual(bodies.map(buildOf).sort(), ['/* build #1 */', '/* build #2 */'])
})

test('굽는 중에 온 요청은 도는 굽기가 아니라 그다음 굽기를 받는다', async () => {
  const { compile, calls } = heldCompile()
  const { url } = await serve(compile)

  const first = fetch(url)
  await until(() => calls.length === 1, '첫 굽기')
  const second = fetch(url)
  await new Promise((resolve) => setTimeout(resolve, 50))
  calls[0].resolve(build(1))

  assert.equal(buildOf(await (await first).text()), '/* build #1 */')
  await until(() => calls.length === 2, '두 번째 굽기')
  calls[1].resolve(build(2))
  assert.equal(buildOf(await (await second).text()), '/* build #2 */')
  assert.equal(calls.length, 2)
})

test('한 굽기가 도는 사이 온 요청 여럿은 다음 굽기 하나를 나눠 받는다', async () => {
  const { compile, calls } = heldCompile()
  const bake = createLatestQueue(compile)

  const first = bake()
  const waiting = [bake(), bake(), bake()]
  assert.equal(calls.length, 1, '도는 굽기가 있는데 또 시작했다')

  calls[0].resolve(build(1))
  assert.deepEqual(await first, build(1))
  await until(() => calls.length === 2, '다음 굽기')
  calls[1].resolve(build(2))

  for (const result of await Promise.all(waiting)) assert.deepEqual(result, build(2))
  assert.equal(calls.length, 2, '기다리던 요청마다 따로 구웠다')

  void bake()
  assert.equal(calls.length, 3, '다 끝난 뒤 온 요청은 새로 굽는다')
})

test('굽기가 실패하면 500 text/plain 에 ANSI 를 걷은 오류를 전부 싣고, 서버는 살아 다음 요청을 다시 굽는다', async () => {
  let compiled = 0
  const { url, lines } = await serve(async () => {
    compiled += 1
    if (compiled === 2) {
      return {
        ok: false,
        errors: [
          { file: 'src/index.ts', message: '\u001b[31mUnexpected token (3:1)\u001b[39m' },
          { file: 'src/menu.ts', message: 'Could not resolve "./gone"' },
        ],
      }
    }
    return build(compiled)
  })
  assert.equal((await fetch(url)).status, 200)

  const failed = await fetch(url)
  assert.equal(failed.status, 500)
  assert.equal(failed.headers.get('content-type'), 'text/plain; charset=utf-8')
  assert.equal(
    await failed.text(),
    'settings 를 굽지 못했다\nsrc/index.ts: Unexpected token (3:1)\n\nsrc/menu.ts: Could not resolve "./gone"',
    '마지막 성공 모듈이 아니라 오류 전부를 낸다',
  )
  assert.ok(lines[1].includes('\u001b[31m'), '터미널에는 색을 남긴다')
  assert.match(lines[1], /^GET \/settings\/index\.bundle\.js 500 · \d+\.\d s\n/)

  const recovered = await fetch(url)
  assert.equal(recovered.status, 200)
  assert.equal(buildOf(await recovered.text()), '/* build #3 */')
})

test('파일에 매이지 않는 실패(esbuild 를 못 엶)도 500 이고, 서버는 산다', async () => {
  let compiled = 0
  const { url } = await serve(async () => {
    compiled += 1
    if (compiled === 1) throw new Error('[react-native-mf] esbuild 를 찾을 수 없다.')
    return build(compiled)
  })

  const failed = await fetch(url)
  assert.equal(failed.status, 500)
  assert.equal(
    await failed.text(),
    'settings 를 굽지 못했다\n[react-native-mf] esbuild 를 찾을 수 없다.',
  )
  assert.equal((await fetch(url)).status, 200)
})

test('번들의 모듈 주소와 hot 주소는 기기가 부른 Host 를 따른다', async () => {
  // Android 에뮬레이터는 10.0.2.2 로 부른다. sourceURL 과 hot 요청이 그 주소여야 기기에서 닿는다
  const { url } = await serve(async () => build(1))
  const viaIp = new URL(url)
  viaIp.hostname = '127.0.0.1'

  const boot = bootOf(await (await fetch(viaIp)).text())

  assert.equal(boot.sourceRoot, `http://127.0.0.1:${viaIp.port}/settings/`)
  assert.equal(boot.hotUrl, `http://127.0.0.1:${viaIp.port}/settings/hot`)
  assert.deepEqual(boot.stamp, { epoch: 'test', version: 1 })
})

test('hot 요청의 커서가 틀리면 굽지 않고 400 text/plain 으로 거절한다', async () => {
  let compiled = 0
  const { url, lines } = await serve(async () => build(++compiled))

  for (const query of ['', 'have=test.1', 'have=test.1&seen=test.x']) {
    const response = await fetch(hotUrl(url, query))
    assert.equal(response.status, 400, query)
    assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8')
    assert.match(await response.text(), /have · seen 은 <epoch>\.<version> 이어야 한다/)
  }
  assert.equal(compiled, 0)
  assert.match(lines[0], /^GET \/settings\/hot 400 /)
})

test('hot 요청은 줄 것이 없으면 붙들었다가 204 로 끝난다', async () => {
  const { url } = await serve(async () => build(1), 30)
  const { stamp } = bootOf(await (await fetch(url)).text())

  const startedAt = performance.now()
  const response = await fetch(hotUrl(url, `have=test.${stamp.version}&seen=test.${stamp.version}`))

  assert.equal(response.status, 204)
  assert.ok(performance.now() - startedAt >= 25, '붙들지 않고 바로 끝났다')
})

test('붙든 hot 요청은 상태를 바꾼 굽기가 깨우고, 그 굽기의 모듈을 200 application/json 으로 받는다', async () => {
  let compiled = 0
  const { url, lines } = await serve(async () => build(++compiled))
  await fetch(url)

  const held = fetch(hotUrl(url, 'have=test.1&seen=test.1'))
  await new Promise((resolve) => setTimeout(resolve, 30))
  await fetch(url)
  const response = await held

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'application/json')
  assert.deepEqual(await response.json(), {
    kind: 'update',
    stamp: { epoch: 'test', version: 2 },
    modules: [['./index.ts', '/* build #2 */']],
    removed: [],
  })
  assert.match(
    lines.find((line) => line.startsWith('hot ')) ?? '',
    /^hot v2 → localhost · 모듈 1개 · \d+\.\d kB$/,
  )
})

test('붙든 hot 요청은 실패한 굽기가 ANSI 를 걷은 오류 전부로 깨운다', async () => {
  let compiled = 0
  const { url, lines } = await serve(async () => {
    compiled += 1
    if (compiled === 1) return build(1)
    return {
      ok: false,
      errors: [
        { file: 'src/index.ts', message: '\u001b[31mUnexpected token (3:1)\u001b[39m' },
        { file: 'src/menu.ts', message: 'Could not resolve "./gone"' },
      ],
    }
  })
  await fetch(url)

  const held = fetch(hotUrl(url, 'have=test.1&seen=test.1'))
  await new Promise((resolve) => setTimeout(resolve, 30))
  await fetch(url)
  const response = await held

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    kind: 'error',
    stamp: { epoch: 'test', version: 2 },
    errors: [
      { file: 'src/index.ts', message: 'Unexpected token (3:1)' },
      { file: 'src/menu.ts', message: 'Could not resolve "./gone"' },
    ],
  })
  assert.match(
    lines.find((line) => line.startsWith('hot ')) ?? '',
    /^hot v2 → localhost · 오류 2개 · \d+\.\d kB$/,
  )
})

/** `srcDir` 의 `index.ts` 를 읽어 엔트리 하나로 굽는 dev */
async function startWatching(srcDir: string, lines: string[]) {
  const server = await startDev({
    name: 'settings',
    entry: './index.ts',
    srcDir,
    compile: async () => ({
      ok: true,
      modules: new Map([
        ['./index.ts', { source: '', code: await readFile(join(srcDir, 'index.ts'), 'utf8') }],
      ]),
      requires: [],
    }),
    runtime: async () => '',
    port: 0,
    log: (line) => lines.push(line),
  })
  servers.push(server)
  return server
}

test('startDev 는 요청도 저장도 없이 띄우자마자 첫 굽기를 돌린다', async () => {
  // 아무도 쓰지 않는 폴더다. 감시가 첫 굽기를 대신 일으킬 수 없다
  const lines: string[] = []
  await startWatching(join(here, 'fixtures/startup-src'), lines)

  await until(() => lines.some((line) => line.startsWith('v1 · index.ts')), '띄울 때의 첫 굽기')
})

test('startDev 는 src 아래 저장마다 다시 굽는다', async () => {
  const srcDir = await mkdtemp(join(tmpdir(), 'rnmf-dev-watch-'))
  await writeFile(join(srcDir, 'index.ts'), 'first')
  const lines: string[] = []
  const server = await startWatching(srcDir, lines)
  await until(() => lines.some((line) => line.startsWith('v1 · index.ts')), '첫 굽기')

  await writeFile(join(srcDir, 'index.ts'), 'second')
  await until(() => lines.some((line) => line.startsWith('v2 · index.ts')), '저장 뒤 굽기')

  await server.close()
  servers.splice(servers.indexOf(server), 1)
  await rm(srcDir, { recursive: true, force: true })
})

test('다른 경로는 굽지 않고 404 로 이 서버가 굽는 이름을 알려준다', async () => {
  // 옛 호스트 배선은 `/index.bundle.js` 를 부른다. 기기에서 무엇이 어긋났는지 보여야 한다
  let compiled = 0
  const { url } = await serve(async () => build(++compiled))

  const response = await fetch(new URL('/index.bundle.js', url))

  assert.equal(response.status, 404)
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8')
  assert.match(await response.text(), /"settings" 만 굽는다\(\/settings\/index\.bundle\.js\)/)
  assert.equal(compiled, 0)
})

test('포트를 이미 쓰고 있으면 EADDRINUSE 로, 경로에 못 쓰는 이름이면 듣기 전에 거절한다', async () => {
  const { url } = await serve(async () => build(1))
  const port = Number(new URL(url).port)
  const start = (name: string, at: number) =>
    startDevServer({
      name,
      session: createDevSession({
        name: 'settings',
        entry: './index.ts',
        epoch: 'test',
        compile: async () => build(1),
        runtime: async () => '',
        log: () => {},
      }),
      port: at,
      log: () => {},
    })

  await assert.rejects(start('settings', port), { code: 'EADDRINUSE' })
  await assert.rejects(start('../settings', 0), /name 은 경로 한 칸이어야 한다/)
})

test('dev 는 --config 하나만 받는다. 이름 · 빌드 옵션 · 포트는 플래그로 열지 않는다', () => {
  assert.deepEqual(parseDevArgs([]), { ok: true, args: { config: undefined } })
  assert.deepEqual(parseDevArgs(['--config', 'a.mjs']), { ok: true, args: { config: 'a.mjs' } })
  assert.deepEqual(parseDevArgs(['--config=a.mjs']), { ok: true, args: { config: 'a.mjs' } })

  assert.deepEqual(parseDevArgs(['--port', '1']), { ok: false, error: '알 수 없는 옵션 "--port"' })
  assert.deepEqual(parseDevArgs(['-n', 'settings']), { ok: false, error: '알 수 없는 옵션 "-n"' })
  assert.deepEqual(parseDevArgs(['--config']), { ok: false, error: '--config 에 값이 없다' })
  assert.deepEqual(parseDevArgs(['--config', '-x']), { ok: false, error: '--config 에 값이 없다' })
  assert.deepEqual(parseDevArgs(['--config=']), { ok: false, error: '--config 에 값이 없다' })
})
