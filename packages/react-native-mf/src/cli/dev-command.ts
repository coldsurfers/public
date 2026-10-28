/**
 * `dev`. 미니앱 번들을 요청마다 구워 메모리에서 내준다. 주소는 `../dev-address` 가 정한다.
 *
 * `./build` · `../deploy/config` 는 부를 때 연다. 인자 오류는 optional peer 없이 끝나야 한다.
 */
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { stripVTControlCharacters } from 'node:util'
import { DEV_PORT, devBundlePath, devBundleUrl } from '../dev-address'
import type { Compiled } from './build'
import { resolveConfigBuild } from './build-options'

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

/** 한 번 굽기. 실패도 값이다. 응답과 터미널 로그가 같은 값에서 나온다 */
export type Bake =
  | { ok: true; code: string; ms: number }
  | { ok: false; error: unknown; ms: number }

/**
 * 굽기 큐. 칸이 둘이다. 도는 것(`running`)과 그다음(`next`).
 *
 * 요청은 **자기가 도착한 뒤 시작한 굽기만** 받는다. 도는 중에 온 요청은 모두 `next` 하나를 나눠
 * 쓴다. 고친 뒤 리로드했는데 고치기 전 번들이 오는 일이 없고, transpile 자리를 같이 쓰는 굽기가
 * 겹쳐 돌지 않는다. 마지막 성공본을 들지 않으니 실패한 뒤 옛 번들을 내주지도 않는다.
 */
export function createBakeQueue(compile: () => Promise<Compiled>): () => Promise<Bake> {
  let running: Promise<Bake> | undefined
  let next: Promise<Bake> | undefined

  const start = () => {
    const startedAt = performance.now()
    const ms = () => performance.now() - startedAt
    const baking = compile().then(
      ({ code }): Bake => ({ ok: true, code, ms: ms() }),
      (error: unknown): Bake => ({ ok: false, error, ms: ms() }),
    )
    running = baking
    baking.then(() => {
      if (running === baking) running = undefined
    })
    return baking
  }

  return () => {
    if (next) return next
    if (!running) return start()
    next = running.then(() => {
      next = undefined
      return start()
    })
    return next
  }
}

const PLAIN_TEXT = 'text/plain; charset=utf-8'

export type DevServer = { url: string; close(): Promise<void> }

/**
 * 테스트 이음새다. `compile` 을 주입받아 esbuild 없이 HTTP 동작을 판정하고, 테스트는 `port: 0` 을
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
  compile: () => Promise<Compiled>
  port: number
  log: (line: string) => void
}): Promise<DevServer> {
  const { name, log } = input
  const path = devBundlePath(name)
  const bake = createBakeQueue(input.compile)

  const server = createServer(async (request, response) => {
    const requested = `${request.method} ${request.url}`
    if (request.method !== 'GET' || request.url !== path) {
      const notFound = `이 dev 서버는 "${name}" 만 굽는다(${path})`
      log(`${requested} 404 (${notFound})`)
      response.writeHead(404, { 'content-type': PLAIN_TEXT }).end(notFound)
      return
    }

    const result = await bake()
    const took = `${(result.ms / 1000).toFixed(1)} s`
    if (result.ok) {
      const size = `${(Buffer.byteLength(result.code) / 1024).toFixed(1)} kB`
      log(`${requested} 200 · ${took} · ${size}`)
      response
        .writeHead(200, { 'content-type': 'application/javascript', 'cache-control': 'no-store' })
        .end(result.code)
      return
    }

    const message = result.error instanceof Error ? result.error.message : String(result.error)
    log(`${requested} 500 · ${took}\n${message}`)
    response
      .writeHead(500, { 'content-type': PLAIN_TEXT })
      .end(`${name} 를 굽지 못했다\n${stripVTControlCharacters(message)}`)
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

  const { compileBundle } = await import('./build')
  let server: DevServer
  try {
    server = await startDevServer({
      name: config.name,
      compile: async () => compileBundle(await resolveConfigBuild(config, cwd), 'dev'),
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
