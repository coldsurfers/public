/**
 * `./cli` 진입점 — 명령 해석과 `run`. 실행은 `./bin` 이 한다. 여기서 최상단 실행을 하면
 * `import` 만 한 쪽의 `process.exitCode` 가 바뀐다.
 *
 * `./build` 는 **부를 때** 연다. 거기서 esbuild·babel 을 물기 때문에, 최상단 import 로 두면
 * `--help` 와 인자 오류조차 optional peer 를 다 깔아야 돌아간다.
 */
import { resolve } from 'node:path'
import { parseBuildOptions } from './build-options'
import { parseDeployArgs, runDeployCommand } from './deploy-command'
import { parseDevArgs, runDevCommand } from './dev-command'
import { readSharedManifest } from './shared-manifest'

const USAGE = `react-native-mf <command>

  build     미니앱 엔트리를 원격 번들로 굽는다
  dev       요청마다 굽는 dev 번들 서버를 :8082 에 띄운다(react-native-mf.config.ts)
  deploy    굽고 저장소에 올린 뒤 채널 매니페스트에 더한다(react-native-mf.config.ts)
  rollback  채널 매니페스트에서 최신 릴리스를 끈다
  promote   다른 채널에 낸 릴리스를 굽지 않고 이 채널 매니페스트에 더한다

build 옵션
  -o, --out-file <path>     산출물 경로 (필수)
  -n, --name <name>         원격 이름 — 호스트가 이 이름으로 회수한다 (필수)
      --src <dir>           소스 디렉터리 (기본: src)
      --entry <file>        --src 기준 엔트리 (기본: index.ts)
      --shared <names>      shared scope 로 치환할 모듈. 반복하거나 쉼표로 잇는다
                            (기본: react,react-native)
      --shared-from <path>  호스트가 내놓은 shared 매니페스트(JSON 배열)에서 읽는다.
                            --shared 와 같이 쓸 수 없다
      --babel-config <path> 미니앱 babel config. 생략하면 cwd 에서 찾는다
      --no-block-scoping    Hermes 용 let/const 제거 후처리를 끈다

dev 옵션
      --config <path>       config 경로 (기본: react-native-mf.config.{ts,mjs,js})

deploy · rollback · promote 옵션
  -c, --channel <name>      채널 (필수) — staging · production 등
  -i, --interactive         deploy 는 버전 올리기 · 확인을, promote 는 확인을 묻는다
      --config <path>       config 경로 (기본: react-native-mf.config.{ts,mjs,js})
      --to <version>        rollback 이 켤 버전 (기본: 켜진 것 중 두 번째)
      --from <channel>      promote 가 읽을 채널 (promote 필수)
      --version <version>   promote 할 버전 (기본: --from 에서 켜진 최신)
`

export async function run(argv: string[]): Promise<number> {
  const [command, ...rest] = argv

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(USAGE)
    return command ? 0 : 1
  }

  if (command === 'deploy' || command === 'rollback' || command === 'promote') {
    const parsedDeploy = parseDeployArgs(command, rest)
    if (!parsedDeploy.ok) {
      process.stderr.write(`[react-native-mf] ${parsedDeploy.error}\n\n${USAGE}`)
      return 1
    }
    try {
      return await runDeployCommand(parsedDeploy.args, process.cwd())
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
      return 1
    }
  }

  if (command === 'dev') {
    const parsedDev = parseDevArgs(rest)
    if (!parsedDev.ok) {
      process.stderr.write(`[react-native-mf] ${parsedDev.error}\n\n${USAGE}`)
      return 1
    }
    try {
      return await runDevCommand(parsedDev.args, process.cwd())
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
      return 1
    }
  }

  if (command !== 'build') {
    process.stderr.write(`[react-native-mf] 알 수 없는 명령 "${command}"\n\n${USAGE}`)
    return 1
  }

  const parsed = parseBuildOptions(rest, process.cwd())
  if (!parsed.ok) {
    process.stderr.write(`[react-native-mf] ${parsed.error}\n\n${USAGE}`)
    return 1
  }

  try {
    // 매니페스트는 `./build` 를 열기 **전에** 읽는다. 경로가 틀린 건 인자 오류와 같은
    // 종류라 esbuild·babel 을 깔지 않은 쪽에서도 잡혀야 한다.
    const options = parsed.sharedFrom
      ? {
          ...parsed.options,
          shared: await readSharedManifest(resolve(parsed.options.cwd, parsed.sharedFrom)),
        }
      : parsed.options

    const { runBuild } = await import('./build')
    const { outFile, bytes } = await runBuild(options)

    process.stdout.write(`[react-native-mf] ${outFile} (${(bytes / 1024).toFixed(1)} kB)\n`)
    return 0
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
