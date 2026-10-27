/**
 * `dev`. 미니앱 번들을 요청마다 구워 메모리에서 내준다. 주소는 `../dev-address` 가 정한다.
 * 번들은 모듈 단위다(`./dev/`). 굽기와 상태는 `./dev/session` 이 들고, 여기는 HTTP 와 터미널이다.
 *
 * `./dev/*` · `../deploy/config` 는 부를 때 연다. 인자 오류는 optional peer 없이 끝나야 한다.
 */
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { stripVTControlCharacters } from 'node:util'
import { DEV_PORT, devBundlePath, devBundleUrl } from '../dev-address'
import { resolveConfigBuild } from './build-options'
import type { DevSession } from './dev/session'

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

export type DevServer = { url: string; close(): Promise<void> }

/**
 * 테스트 이음새다. 세션의 굽기를 주입받아 esbuild 없이 HTTP 동작을 판정하고, 테스트는 `port: 0` 을
 * 준다. CLI 는 언제나 `DEV_PORT` 다.
 *
 *   GET devBundlePath(name)  구웠다   → 200 application/javascript · no-store
 *                            못 구웠다 → 500 text/plain · ANSI 를 걷은 오류. 터미널엔 색 그대로
 *   그 밖                              → 404 text/plain · 이 서버가 굽는 이름
 *
 * 이름이 경로 한 칸에 안 맞으면 듣기 전에 거절한다. 포트를 이미 쓰고 있으면 `EADDRINUSE` 로 거절한다.
 */
export async function startDevServer(input: {
  name: string
  session: DevSession
  port: number
  log: (line: string) => void
}): Promise<DevServer> {
  const { name, session, log } = input
  const path = devBundlePath(name)

  const server = createServer(async (request, response) => {
    const requested = `${request.method} ${request.url}`
    if (request.method !== 'GET' || request.url !== path) {
      const notFound = `이 dev 서버는 "${name}" 만 굽는다(${path})`
      log(`${requested} 404 (${notFound})`)
      response.writeHead(404, { 'content-type': PLAIN_TEXT }).end(notFound)
      return
    }

    // 기기가 부른 주소 그대로 번들에 싣는다. iOS 시뮬레이터는 localhost, Android 에뮬레이터는 10.0.2.2 다
    const host = request.headers.host ?? `localhost:${(server.address() as AddressInfo).port}`
    const result = await session.bundle(`http://${host}`)
    const took = `${(result.ms / 1000).toFixed(1)} s`
    if (result.ok) {
      const size = `${(Buffer.byteLength(result.code) / 1024).toFixed(1)} kB`
      log(`${requested} 200 · ${took} · ${size}`)
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
        server.close(() => resolve())
        // close 만으로는 응답을 기다리는 연결이 끝날 때까지 닫히지 않는다
        server.closeAllConnections()
      }),
  }
}

/**
 * config 를 읽고 `DEV_PORT` 에서 듣는다. 포트가 곧 미니앱당 dev 하나라는 잠금이다.
 *
 * 듣기 시작하면 0 을 돌려준다. 프로세스는 서버가 붙들고, 끄는 건 Ctrl-C 다. 굽기는 첫 요청이
 * 시작하고, config 의 `outFile` 은 쓰지 않는다.
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
  const { createDevSession } = await import('./dev/session')
  let server: DevServer
  try {
    server = await startDevServer({
      name: config.name,
      session: createDevSession({
        name: config.name,
        entry: entryId(options),
        epoch: Date.now().toString(36),
        compile: createModuleCompiler(resolveOptions),
        runtime: () => buildRuntime({ blockScoping: options.blockScoping }),
        log: out,
      }),
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
  out('요청마다 다시 굽는다. config · babel config · 의존을 바꾸면 다시 띄운다')
  return 0
}
