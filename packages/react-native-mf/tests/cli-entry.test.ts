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

  assert.equal(await run(['--help']), 0)
  assert.equal(await run([]), 1, '명령이 없으면 usage 를 내고 실패로 끝난다')
  assert.equal(await run(['bundle']), 1, '모르는 명령은 usage 를 내고 실패로 끝난다')

  // 인자 오류는 `./build` 를 **열기 전에** 끝난다 — esbuild·babel 이 없는 환경에서도
  // 여기까지는 돌아야 한다. 최상단 import 로 되돌아가면 이 줄이 모듈 로드에서 터진다.
  assert.equal(await run(['build']), 1, '필수 옵션이 없으면 실패로 끝난다')
})

test('매니페스트 오류도 ./build 를 열기 전에 끝난다', async () => {
  const { run } = await import('../src/cli/index')

  // 없는 매니페스트는 인자 오류와 같은 종류다 — peer 를 깔지 않은 쪽에서도 잡혀야 한다.
  assert.equal(
    await run(['build', '-o', 'a.js', '-n', 'settings', '--shared-from', 'no-such.json']),
    1,
  )

  // 정본을 하나로 모으려고 연 플래그다. 둘을 같이 받으면 목적이 사라진다.
  assert.equal(
    await run([
      'build',
      '-o',
      'a.js',
      '-n',
      'settings',
      '--shared',
      'react',
      '--shared-from',
      'a.json',
    ]),
    1,
  )
})
