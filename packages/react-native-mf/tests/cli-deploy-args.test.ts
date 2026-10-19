import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseDeployArgs } from '../src/cli/deploy-command'

test('promote 는 --from 을 요구하고 --version 을 받는다', () => {
  assert.deepEqual(
    parseDeployArgs('promote', [
      '-c',
      'production',
      '--from',
      'staging',
      '--version',
      '1.2.0',
      '-i',
    ]),
    {
      ok: true,
      args: {
        command: 'promote',
        channel: 'production',
        interactive: true,
        config: undefined,
        from: 'staging',
        version: '1.2.0',
      },
    },
  )
  assert.deepEqual(parseDeployArgs('promote', ['-c', 'production']), {
    ok: false,
    error: '--from 은 필수다',
  })
})

test('다른 명령의 옵션은 거절한다', () => {
  assert.deepEqual(parseDeployArgs('deploy', ['-c', 'staging', '--from', 'x']), {
    ok: false,
    error: '--from 는 promote 에만 쓴다',
  })
  assert.deepEqual(parseDeployArgs('promote', ['-c', 'p', '--from', 's', '--to', '1.0.0']), {
    ok: false,
    error: '--to 는 rollback 에만 쓴다',
  })
})
