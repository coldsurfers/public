/**
 * bin — 미니앱 번들을 굽는다. `../esbuild` 를 감싸는 얇은 껍데기다.
 *
 * 이 모듈은 **bin 이면서 동시에 `./cli` 진입점**이다(`exports` 맵). 그래서 최상단에서 그냥
 * 실행하면 `import` 만 한 쪽의 `process.exitCode` 가 1 이 되고 stdout 에 usage 가 찍힌다 —
 * `run` 을 테스트하려던 프로세스가 실패로 끝난다. 아래 `isBin()` 이 그걸 가른다.
 *
 * `./build` 는 **부를 때** 연다. 거기서 esbuild·babel 을 물기 때문에, 최상단 import 로 두면
 * `--help` 와 인자 오류조차 optional peer 를 다 깔아야 돌아간다.
 */
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseBuildOptions } from './build-options'
import { readSharedManifest } from './shared-manifest'

const USAGE = `react-native-mf <command>

  build   미니앱 엔트리를 원격 번들로 굽는다

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
`

export async function run(argv: string[]): Promise<number> {
  const [command, ...rest] = argv

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(USAGE)
    return command ? 0 : 1
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

/**
 * node 가 **이 파일을 직접 실행**했는가. `import` 로 들어온 경우와 가른다.
 *
 * 양쪽 다 `realpath` 로 편다 — pnpm 이 `node_modules/.bin/react-native-mf` 를 심링크로 걸어서
 * `process.argv[1]` 이 심링크 경로로 들어온다. 풀지 않으면 bin 실행인데도 `false` 가 된다.
 */
function isBin(): boolean {
  const entry = process.argv[1]
  if (entry == null) return false
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isBin()) {
  run(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code
    },
    (error: unknown) => {
      process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : error}\n`)
      process.exitCode = 1
    },
  )
}
