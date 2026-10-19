/**
 * bin 진입점 — 실행만 한다. `./cli` 는 import 할 수 있는 `run` 만 내놓는다.
 *
 * 둘을 한 파일에 두고 "직접 실행됐는가" 를 경로로 가르면, 번들러가 `run` 을 공유 청크로 옮기는
 * 순간 그 비교가 늘 거짓이 되어 bin 이 아무것도 안 하고 0 으로 끝난다.
 */
import { run } from './index'

run(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code
  },
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : error}\n`)
    process.exitCode = 1
  },
)
