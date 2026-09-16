/**
 * `./cli` 는 bin 이면서 동시에 import 가능한 진입점이다(`exports` 맵). 최상단에서 그냥
 * 실행하면 import 만 한 쪽의 `process.exitCode` 가 1 이 되는데, **타입도 빌드도 그걸 안 잡는다.**
 * 조용히 되돌아갈 수 있는 종류라 테스트로 박는다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('import 만으로는 process.exitCode 를 건드리지 않는다', async () => {
  const before = process.exitCode

  const mod = await import('../src/cli/index')

  assert.equal(process.exitCode, before, 'import 이 process.exitCode 를 바꿨다')
  assert.equal(typeof mod.run, 'function', 'run 이 여전히 열려 있어야 한다')
})

test('run 은 직접 부르면 종료 코드를 돌려준다', async () => {
  const { run } = await import('../src/cli/index')

  assert.equal(run(['--help']), 0)
  assert.equal(run([]), 1, '명령이 없으면 usage 를 내고 실패로 끝난다')
  assert.equal(run(['build']), 1, 'Phase 1 에선 아직 구현되지 않았다')
})
