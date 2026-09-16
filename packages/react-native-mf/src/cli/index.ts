/**
 * bin — 미니앱 번들을 굽는다. `../esbuild` 를 감싸는 얇은 껍데기다.
 *
 * ⏸ **Phase 1** — 실행 가능한 명령은 아직 없다.
 *
 * 이 모듈은 **bin 이면서 동시에 `./cli` 진입점**이다(`exports` 맵). 그래서 최상단에서 그냥
 * 실행하면 `import` 만 한 쪽의 `process.exitCode` 가 1 이 되고 stdout 에 usage 가 찍힌다 —
 * `run` 을 테스트하려던 프로세스가 실패로 끝난다. 아래 `isBin()` 이 그걸 가른다.
 */
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const USAGE = `react-native-mf <command>

  build   미니앱 엔트리를 원격 번들로 굽는다   (Phase 1)
`

export function run(argv: string[]): number {
  const [command] = argv

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(USAGE)
    return command ? 0 : 1
  }

  process.stderr.write(`[react-native-mf] "${command}" 는 아직 구현되지 않았다 (Phase 1).\n`)
  return 1
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

if (isBin()) process.exitCode = run(process.argv.slice(2))
