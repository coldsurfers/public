/**
 * `dev` 서버. 굽기를 주입해 esbuild 없이 HTTP 동작과 굽기 큐를 판정한다. 포트는 언제나 0 이다.
 *
 * 고정하는 것은 둘이다. **요청은 자기가 온 뒤 시작한 굽기만 받는다**(고친 뒤 리로드했는데 고치기
 * 전 번들이 오지 않는다) · **실패는 기기와 터미널에 그대로 보이고 서버는 산다.**
 */
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import type { Compiled } from '../src/cli/build'
import {
  createBakeQueue,
  type DevServer,
  parseDevArgs,
  startDevServer,
} from '../src/cli/dev-command'

const servers: DevServer[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()))
})

const build = (n: number): Compiled => ({ code: `/* build #${n} */`, requires: [] })

/** 굽기를 테스트가 손으로 끝낸다. 불린 횟수가 곧 굽기 횟수다 */
function heldCompile() {
  const calls: { resolve: (compiled: Compiled) => void }[] = []
  const compile = () => new Promise<Compiled>((resolve) => calls.push({ resolve }))
  return { compile, calls }
}

async function serve(compile: () => Promise<Compiled>) {
  const lines: string[] = []
  const server = await startDevServer({
    name: 'settings',
    compile,
    port: 0,
    log: (line) => lines.push(line),
  })
  servers.push(server)
  return { url: server.url, lines }
}

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
  assert.equal(await response.text(), '/* build #1 */')
  assert.match(lines[0], /^GET \/settings\/index\.bundle\.js 200 · \d+\.\d s · 0\.0 kB$/)
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
  assert.deepEqual(bodies.sort(), ['/* build #1 */', '/* build #2 */'])
})

test('굽는 중에 온 요청은 도는 굽기가 아니라 그다음 굽기를 받는다', async () => {
  const { compile, calls } = heldCompile()
  const { url } = await serve(compile)

  const first = fetch(url)
  await until(() => calls.length === 1, '첫 굽기')
  const second = fetch(url)
  await new Promise((resolve) => setTimeout(resolve, 50))
  calls[0].resolve(build(1))

  assert.equal(await (await first).text(), '/* build #1 */')
  await until(() => calls.length === 2, '두 번째 굽기')
  calls[1].resolve(build(2))
  assert.equal(await (await second).text(), '/* build #2 */')
  assert.equal(calls.length, 2)
})

test('한 굽기가 도는 사이 온 요청 여럿은 다음 굽기 하나를 나눠 받는다', async () => {
  const { compile, calls } = heldCompile()
  const bake = createBakeQueue(compile)

  const first = bake()
  const waiting = [bake(), bake(), bake()]
  assert.equal(calls.length, 1, '도는 굽기가 있는데 또 시작했다')

  calls[0].resolve(build(1))
  const firstResult = await first
  assert.equal(firstResult.ok && firstResult.code, '/* build #1 */')
  await until(() => calls.length === 2, '다음 굽기')
  calls[1].resolve(build(2))

  for (const result of await Promise.all(waiting)) {
    assert.equal(result.ok && result.code, '/* build #2 */')
  }
  assert.equal(calls.length, 2, '기다리던 요청마다 따로 구웠다')

  void bake()
  assert.equal(calls.length, 3, '다 끝난 뒤 온 요청은 새로 굽는다')
})

test('굽기가 실패하면 500 text/plain 에 ANSI 를 걷은 오류를 싣고, 서버는 살아 다음 요청을 다시 굽는다', async () => {
  let compiled = 0
  const { url, lines } = await serve(async () => {
    compiled += 1
    if (compiled === 1) throw new Error('\u001b[31msrc/index.ts: Unexpected token (3:1)\u001b[39m')
    return build(compiled)
  })

  const failed = await fetch(url)
  assert.equal(failed.status, 500)
  assert.equal(failed.headers.get('content-type'), 'text/plain; charset=utf-8')
  assert.equal(await failed.text(), 'settings 를 굽지 못했다\nsrc/index.ts: Unexpected token (3:1)')
  assert.ok(lines[0].includes('\u001b[31m'), '터미널에는 색을 남긴다')
  assert.match(lines[0], /^GET \/settings\/index\.bundle\.js 500 · \d+\.\d s\n/)

  const recovered = await fetch(url)
  assert.equal(recovered.status, 200)
  assert.equal(await recovered.text(), '/* build #2 */', '실패한 뒤 옛 번들이 아니라 새로 구웠다')
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
    startDevServer({ name, compile: async () => build(1), port: at, log: () => {} })

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
