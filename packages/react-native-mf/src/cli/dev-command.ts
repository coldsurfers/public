/**
 * `dev`. 미니앱 src 를 감시해 바뀔 때마다 굽고, 번들과 hot 응답을 메모리에서 내준다. 주소는
 * `../dev-address` 가 정한다. 번들은 모듈 단위다(`./dev/`). 굽기와 상태는 `./dev/session` 이 들고,
 * 여기는 HTTP · 감시 · 터미널이다.
 *
 * `./dev/*` · `../deploy/config` 는 부를 때 연다. 인자 오류는 optional peer 없이 끝나야 한다.
 */
import { watch } from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { stripVTControlCharacters } from 'node:util'
import { DEV_PORT, devBundlePath, devBundleUrl } from '../dev-address'
import { resolveConfigBuild } from './build-options'
import type { PassResult } from './dev/modules'
import type { DevSession } from './dev/session'
import type { ModuleId, Reply } from './dev/wire'

export type DevArgs = { config?: string }

/** `--config <path>` 와 `--config=<path>` 만 받는다. 이름 · 빌드 옵션은 config 가 정본이다 */
export function parseDevArgs(
  argv: readonly string[],
): { ok: true; args: DevArgs } | { ok: false; error: string } {
  let config: string | undefined
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    const inline = token.startsWith('--config=') ? token.slice('--config='.length) : undefined
    if (token !== '--config' && inline === undefined) {
      return { ok: false, error: `알 수 없는 옵션 "${token}"` }
    }
    const value = inline ?? argv[index + 1]
    if (!value || (inline === undefined && value.startsWith('-'))) {
      return { ok: false, error: '--config 에 값이 없다' }
    }
    if (inline === undefined) index += 1
    config = value
  }
  return { ok: true, args: { config } }
}

const PLAIN_TEXT = 'text/plain; charset=utf-8'
/** hot 요청을 붙드는 시간. 기기는 응답을 받는 대로 다시 부른다 */
const HOT_HOLD_MS = 20_000
/** 저장 한 번에 감시 이벤트가 여럿 온다(원자적 저장 · 포매터). 조용해진 뒤 한 번 굽는다 */
const QUIET_MS = 25

export type DevServer = { url: string; close(): Promise<void> }

/**
 * 테스트 이음새다. 세션의 굽기를 주입받아 esbuild 없이 HTTP 동작을 판정하고, 테스트는 `port: 0` 을
 * 준다. CLI 는 언제나 `DEV_PORT` 다.
 *
 *   GET devBundlePath(name)  구웠다   → 200 application/javascript · no-store
 *                            못 구웠다 → 500 text/plain · ANSI 를 걷은 오류. 터미널엔 색 그대로
 *   GET hotPath(name)        줄 것이 있다       → 200 application/json · `Reply`
 *       ?have=<E>.<V>        `holdMs` 동안 없다 → 204
 *       &seen=<E>.<V>        커서가 틀렸다      → 400 text/plain
 *   그 밖                              → 404 text/plain · 이 서버가 굽는 이름
 *
 * 이름이 경로 한 칸에 안 맞으면 듣기 전에 거절한다. 포트를 이미 쓰고 있으면 `EADDRINUSE` 로 거절한다.
 * `close` 는 붙든 hot 요청도 놓는다.
 */
export async function startDevServer(input: {
  name: string
  session: DevSession
  port: number
  log: (line: string) => void
  holdMs?: number
}): Promise<DevServer> {
  const { name, session, log, holdMs = HOT_HOLD_MS } = input
  const path = devBundlePath(name)
  const { hotPath, parseCursor } = await import('./dev/session')
  const hot = hotPath(name)

  const server = createServer(async (request, response) => {
    const requested = `${request.method} ${request.url}`
    // 기기가 부른 주소 그대로 번들에 싣는다. iOS 시뮬레이터는 localhost, Android 에뮬레이터는 10.0.2.2 다
    const host = request.headers.host ?? `localhost:${(server.address() as AddressInfo).port}`
    const url = request.url ?? ''
    const queryAt = url.indexOf('?')
    const [pathname, query] =
      queryAt === -1 ? [url, ''] : [url.slice(0, queryAt), url.slice(queryAt)]

    if (request.method === 'GET' && pathname === hot) {
      const cursor = parseCursor(new URLSearchParams(query))
      if (!cursor) {
        const bad = 'have · seen 은 <epoch>.<version> 이어야 한다'
        log(`${requested} 400 (${bad})`)
        response.writeHead(400, { 'content-type': PLAIN_TEXT }).end(bad)
        return
      }
      const reply = await session.next(cursor, holdMs)
      if (!reply) {
        response.writeHead(204).end()
        return
      }
      const body = JSON.stringify(reply)
      log(
        `hot v${reply.stamp.version} → ${host.replace(/:\d+$/, '')} · ${describe(reply)} · ${kB(body)}`,
      )
      response
        .writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
        .end(body)
      return
    }

    if (request.method !== 'GET' || request.url !== path) {
      const notFound = `이 dev 서버는 "${name}" 만 굽는다(${path})`
      log(`${requested} 404 (${notFound})`)
      response.writeHead(404, { 'content-type': PLAIN_TEXT }).end(notFound)
      return
    }

    const result = await session.bundle(`http://${host}`)
    const took = `${(result.ms / 1000).toFixed(1)} s`
    if (result.ok) {
      log(`${requested} 200 · ${took} · ${kB(result.code)} · v${result.version}`)
      response
        .writeHead(200, { 'content-type': 'application/javascript', 'cache-control': 'no-store' })
        .end(result.code)
      return
    }

    log(`${requested} 500 · ${took}\n${result.message}`)
    response
      .writeHead(500, { 'content-type': PLAIN_TEXT })
      .end(`${name} 를 굽지 못했다\n${stripVTControlCharacters(result.message)}`)
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(input.port, () => {
      server.off('error', reject)
      resolve()
    })
  })

  const { port } = server.address() as AddressInfo
  return {
    url: devBundleUrl('localhost', name, port),
    close: () =>
      new Promise((resolve) => {
        session.close()
        server.close(() => resolve())
        // close 만으로는 응답을 기다리는 연결이 끝날 때까지 닫히지 않는다
        server.closeAllConnections()
      }),
  }
}

const kB = (text: string) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} kB`

const describe = (reply: Reply) =>
  reply.kind === 'snapshot'
    ? `스냅숏 · 모듈 ${reply.modules.length}개`
    : `모듈 ${reply.modules.length}개${reply.removed.length > 0 ? ` · 지움 ${reply.removed.length}개` : ''}`

/**
 * dev 한 벌 — 세션 · HTTP · src 감시. 듣자마자 첫 굽기를 시작한다. babel 콜드 스타트(수백 ms)가
 * 첫 번들 요청이 아니라 여기서 지나간다. CLI 는 `DEV_PORT` 를, 테스트는 `port: 0` 을 준다.
 */
export async function startDev(input: {
  name: string
  entry: ModuleId
  srcDir: string
  compile: () => Promise<PassResult>
  runtime: () => Promise<string>
  port: number
  log: (line: string) => void
}): Promise<DevServer> {
  const { name, port, log } = input
  const { createDevSession } = await import('./dev/session')
  const session = createDevSession({
    name,
    entry: input.entry,
    epoch: Date.now().toString(36),
    compile: input.compile,
    runtime: input.runtime,
    log,
  })

  // 감시 이벤트는 신호일 뿐이다. 굽기가 엔트리부터 트리를 다시 읽으니 놓치거나 겹친 이벤트가
  // 상태를 어긋내지 않는다
  let quiet: ReturnType<typeof setTimeout> | undefined
  const watcher = watch(input.srcDir, { recursive: true }, () => {
    clearTimeout(quiet)
    quiet = setTimeout(session.changed, QUIET_MS)
  })
  const stopWatching = () => {
    clearTimeout(quiet)
    watcher.close()
  }

  let server: DevServer
  try {
    server = await startDevServer({ name, session, port, log })
  } catch (error) {
    stopWatching()
    throw error
  }
  session.changed()
  return {
    url: server.url,
    close: () => {
      stopWatching()
      return server.close()
    },
  }
}

/**
 * config 를 읽고 `DEV_PORT` 에서 듣는다. 포트가 곧 미니앱당 dev 하나라는 잠금이다.
 *
 * 듣기 시작하면 0 을 돌려준다. 프로세스는 서버와 감시가 붙들고, 끄는 건 Ctrl-C 다. config 의
 * `outFile` 은 쓰지 않는다.
 */
export async function runDevCommand(args: DevArgs, cwd: string): Promise<number> {
  const out = (line: string) => process.stdout.write(`[react-native-mf] ${line}\n`)

  const { loadConfig } = await import('../deploy/config')
  let config: Awaited<ReturnType<typeof loadConfig>>
  try {
    config = await loadConfig(cwd, args.config)
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n` +
        '[react-native-mf] dev 는 deploy 와 같은 config 를 연다. 배포 비밀이 없다고 import 에서 ' +
        '던지는 config 라면 그 검사를 지운다. s3Storage 는 bucket 이 비어도 쓸 때까지 던지지 않는다.\n',
    )
    return 1
  }

  // 굽기마다 다시 푼다. `sharedFrom` 매니페스트를 호스트가 다시 내면 다음 굽기가 본다
  const resolveOptions = () => resolveConfigBuild(config, cwd)
  const options = await resolveOptions()
  const { buildRuntime, createModuleCompiler, entryId } = await import('./dev/modules')
  let server: DevServer
  try {
    server = await startDev({
      name: config.name,
      entry: entryId(options),
      srcDir: resolve(options.cwd, options.src),
      compile: createModuleCompiler(resolveOptions),
      runtime: () => buildRuntime({ blockScoping: options.blockScoping }),
      port: DEV_PORT,
      log: out,
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EADDRINUSE') {
      process.stderr.write(
        `[react-native-mf] ${DEV_PORT} 를 이미 쓰고 있다. react-native-mf dev 가 이미 떠 있는가?\n`,
      )
      return 1
    }
    throw error
  }

  out(`dev ${config.name} → ${server.url}`)
  out('저장하면 바뀐 모듈만 기기로 보낸다. config · babel config · 의존을 바꾸면 다시 띄운다')
  return 0
}
