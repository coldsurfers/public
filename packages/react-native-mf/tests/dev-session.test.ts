/**
 * dev 세션의 상태. `commit` 이 굽기를 받아 무엇을 올리고 무엇을 그대로 두는지, 그 상태에서 번들이
 * 무엇을 내는지 본다.
 *
 * 버전은 다음 단계에서 기기가 "어디까지 받았는가" 를 재는 자다. 바뀐 게 없는데 오르면 기기가 빈
 * 갱신을 받고, 바뀌었는데 안 오르면 갱신을 놓친다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { PassError, PassResult } from '../src/cli/dev/modules'
import { commit, createDevSession, emptyState } from '../src/cli/dev/session'
import type { ModuleId } from '../src/cli/dev/wire'

const pass = (modules: Record<string, string>, requires: string[] = []): PassResult => ({
  ok: true,
  modules: new Map(
    Object.entries(modules).map(([id, code]) => [id as ModuleId, { source: code, code }]),
  ),
  requires,
})
const failed = (...errors: PassError[]): PassResult => ({ ok: false, errors })

const syntax = { file: 'src/a.ts', message: 'Unexpected token (3:1)' }
const unresolved = { file: 'src/b.ts', message: 'Could not resolve "./gone"' }

const changedAt = (state: ReturnType<typeof emptyState>) =>
  Object.fromEntries([...state.modules].map(([id, { changedAt }]) => [id, changedAt]))

test('첫 굽기는 모든 모듈을 v1 에 올린다', () => {
  const state = commit(emptyState('e'), pass({ './a.ts': 'a1', './b.ts': 'b1' }, ['react']))

  assert.equal(state.version, 1)
  assert.deepEqual(changedAt(state), { './a.ts': 1, './b.ts': 1 })
  assert.deepEqual(state.requires, ['react'])
  assert.equal(state.errors, undefined)
})

test('같은 굽기를 다시 넣으면 상태도 버전도 그대로다', () => {
  const first = commit(emptyState('e'), pass({ './a.ts': 'a1' }))

  assert.equal(commit(first, pass({ './a.ts': 'a1' })), first)
})

test('코드가 바뀐 모듈만 새 버전을 달고, 나머지는 받은 버전을 지킨다', () => {
  const first = commit(emptyState('e'), pass({ './a.ts': 'a1', './b.ts': 'b1' }))
  const second = commit(first, pass({ './a.ts': 'a2', './b.ts': 'b1' }))

  assert.equal(second.version, 2)
  assert.deepEqual(changedAt(second), { './a.ts': 2, './b.ts': 1 })
})

test('지워진 모듈은 지워진 버전을 남기고, 다시 생기면 그 기록이 걷힌다', () => {
  const first = commit(emptyState('e'), pass({ './a.ts': 'a1', './b.ts': 'b1' }))
  const removed = commit(first, pass({ './a.ts': 'a1' }))
  const readded = commit(removed, pass({ './a.ts': 'a1', './b.ts': 'b1' }))

  assert.equal(removed.version, 2)
  assert.deepEqual([...removed.removedAt], [['./b.ts', 2]])
  assert.equal(readded.version, 3)
  assert.deepEqual([...readded.removedAt], [])
  assert.deepEqual(changedAt(readded), { './a.ts': 1, './b.ts': 3 })
})

test('실패한 굽기는 모듈을 그대로 두고 오류를 올린다. 같은 오류면 버전도 그대로다', () => {
  const good = commit(emptyState('e'), pass({ './a.ts': 'a1' }))
  const broken = commit(good, failed(syntax))

  assert.equal(broken.version, 2)
  assert.deepEqual(broken.errors, [syntax])
  assert.equal(broken.modules, good.modules, '실패가 마지막 성공 모듈을 건드렸다')
  assert.equal(commit(broken, failed(syntax)), broken)
  assert.equal(commit(broken, failed(syntax, unresolved)).version, 3, '오류가 늘었는데 안 올랐다')
})

test('고친 굽기는 코드가 실패 전과 같아도 버전을 올리고 오류를 걷는다', () => {
  const good = commit(emptyState('e'), pass({ './a.ts': 'a1' }))
  const fixed = commit(commit(good, failed(syntax)), pass({ './a.ts': 'a1' }))

  assert.equal(fixed.version, 3)
  assert.equal(fixed.errors, undefined)
  assert.deepEqual(changedAt(fixed), { './a.ts': 1 })
})

test('번들은 마지막 굽기를 낸다. 실패 중엔 마지막 성공 모듈이 아니라 오류 전부를 낸다', async () => {
  const passes = [pass({ './index.ts': '/* good */' }), failed(syntax, unresolved)]
  const session = createDevSession({
    name: 'settings',
    entry: './index.ts',
    epoch: 'e',
    compile: async () => passes.shift() ?? assert.fail('굽기를 더 불렀다'),
    runtime: async () => '/* runtime */',
  })

  const good = await session.bundle('http://localhost:8082')
  const broken = await session.bundle('http://localhost:8082')

  assert.ok(good.ok && good.code.includes('/* good */'))
  assert.deepEqual(broken.ok ? undefined : broken.message.split('\n\n'), [
    'src/a.ts: Unexpected token (3:1)',
    'src/b.ts: Could not resolve "./gone"',
  ])
})
