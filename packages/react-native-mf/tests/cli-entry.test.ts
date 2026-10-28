/**
 * `./cli` 는 bin 이면서 동시에 import 가능한 진입점이다(`exports` 맵). 최상단에서 그냥
 * 실행하면 import 만 한 쪽의 `process.exitCode` 가 1 이 되는데, **타입도 빌드도 그걸 안 잡는다.**
 * 조용히 되돌아갈 수 있는 종류라 테스트로 박는다.
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

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

test('bin 은 실제 프로세스로 실행되고 종료 코드를 남긴다', () => {
  const bin = fileURLToPath(new URL('../src/cli/bin.ts', import.meta.url))
  const spawn = (args: string[]) =>
    spawnSync(process.execPath, ['--import', 'tsx', bin, ...args], { encoding: 'utf8' })

  const help = spawn(['--help'])
  assert.equal(help.status, 0)
  assert.match(help.stdout, /deploy/)
  assert.equal(spawn(['deploy']).status, 1, '-c 없는 deploy 가 실패로 끝나지 않았다')
})

test('dev 의 인자 오류와 config 오류도 ./build 를 열기 전에 1 로 끝난다', async () => {
  const { run } = await import('../src/cli/index')

  assert.equal(await run(['dev', '--port', '1']), 1, '포트는 플래그로 열지 않는다')
  assert.equal(await run(['dev', '--config', 'no-such.config.mjs']), 1, 'config 가 없는데 떴다')
})

test('dev 는 config 가 import 에서 던지면 원인과 함께 같은 config 를 연다는 것을 알린다', async () => {
  // 소비처 config 는 배포 비밀이 없으면 import 에서 던졌다. dev 를 처음 띄우는 자리가 거기다
  const dir = await mkdtemp(join(tmpdir(), 'rnmf-dev-config-'))
  const config = join(dir, 'react-native-mf.config.mjs')
  await writeFile(config, "throw new Error('MINI_APP_S3_BUCKET 이 없다')\n")

  try {
    const bin = fileURLToPath(new URL('../src/cli/bin.ts', import.meta.url))
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', bin, 'dev', '--config', config],
      {
        encoding: 'utf8',
      },
    )

    assert.equal(result.status, 1)
    assert.match(result.stderr, /MINI_APP_S3_BUCKET 이 없다/)
    assert.match(result.stderr, /dev 는 deploy 와 같은 config 를 연다/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
