/**
 * dev 세션의 상태. `commit` 이 굽기를 받아 무엇을 올리고 무엇을 그대로 두는지, 그 상태에서 번들과
 * hot 응답이 무엇을 내는지 본다.
 *
 * 버전은 기기가 "어디까지 받았는가" 를 재는 자다. 바뀐 게 없는데 오르면 기기가 빈 갱신을 받고,
 * 바뀌었는데 안 오르면 갱신을 놓친다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { PassResult } from '../src/cli/dev/modules'
import { answer, commit, createDevSession, emptyState, parseCursor } from '../src/cli/dev/session'
import type { Cursor, ModuleId, PassError, Reply, Stamp } from '../src/cli/dev/wire'

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
    log: () => {},
  })

  const good = await session.bundle('http://localhost:8082')
  const broken = await session.bundle('http://localhost:8082')

  assert.ok(good.ok && good.code.includes('/* good */'))
  assert.deepEqual(broken.ok ? undefined : broken.message.split('\n\n'), [
    'src/a.ts: Unexpected token (3:1)',
    'src/b.ts: Could not resolve "./gone"',
  ])
})

const at = (epoch: string, version: number): Stamp => ({ epoch, version })
const cursor = (have: Stamp, seen: Stamp = have): Cursor => ({ have, seen })

/** v1 a·b·c → v2 a 고침 → v3 b 고침 · c 지움 */
function history() {
  const v1 = commit(emptyState('e'), pass({ './a.ts': 'a1', './b.ts': 'b1', './c.ts': 'c1' }))
  const v2 = commit(v1, pass({ './a.ts': 'a2', './b.ts': 'b1', './c.ts': 'c1' }))
  const v3 = commit(v2, pass({ './a.ts': 'a2', './b.ts': 'b2' }))
  return { v1, v2, v3 }
}

test('answer 는 기기가 지금 상태를 이미 봤으면 붙든다', () => {
  const { v3 } = history()

  assert.equal(answer(v3, cursor(at('e', 3))), undefined)
})

test('answer 는 have 뒤에 바뀐 모듈과 지워진 id 만 낸다', () => {
  const { v3 } = history()

  assert.deepEqual(answer(v3, cursor(at('e', 2))), {
    kind: 'update',
    stamp: at('e', 3),
    modules: [['./b.ts', 'b2']],
    removed: ['./c.ts'],
    requires: [],
  })
})

test('answer 는 놓친 버전을 한 번에 접는다', () => {
  const { v3 } = history()

  assert.deepEqual(answer(v3, cursor(at('e', 1))), {
    kind: 'update',
    stamp: at('e', 3),
    modules: [
      ['./a.ts', 'a2'],
      ['./b.ts', 'b2'],
    ],
    removed: ['./c.ts'],
    requires: [],
  })
})

test('answer 는 epoch 이 다르면 모듈 전부를 스냅숏으로 낸다', () => {
  const { v3 } = history()

  assert.deepEqual(answer(v3, cursor(at('old', 7))), {
    kind: 'snapshot',
    stamp: at('e', 3),
    modules: [
      ['./a.ts', 'a2'],
      ['./b.ts', 'b2'],
    ],
    requires: [],
  })
})

test('answer 는 오류가 있는 동안 모듈 대신 오류 전부를 낸다. 스냅숏을 받을 기기도 같다', () => {
  const broken = commit(history().v3, failed(syntax, unresolved))
  const error: Reply = { kind: 'error', stamp: at('e', 4), errors: [syntax, unresolved] }

  assert.deepEqual(answer(broken, cursor(at('e', 3))), error)
  assert.deepEqual(answer(broken, cursor(at('old', 7))), error)
})

test('answer 는 이미 본 오류를 다시 내지 않고 붙든다', () => {
  const broken = commit(history().v3, failed(syntax))

  assert.equal(answer(broken, cursor(at('e', 3), at('e', 4))), undefined)
})

test('answer 는 고친 뒤 have 이후 전부를 낸다. 실패 사이 버전을 건너뛰지 않는다', () => {
  const broken = commit(history().v3, failed(syntax))
  const fixed = commit(broken, pass({ './a.ts': 'a3', './b.ts': 'b2' }))

  assert.deepEqual(answer(fixed, cursor(at('e', 3), at('e', 4))), {
    kind: 'update',
    stamp: at('e', 5),
    modules: [['./a.ts', 'a3']],
    removed: [],
    requires: [],
  })
})

test('answer 는 갱신에도 스냅숏에도 지금 굽기의 shared specifier 전부를 싣는다', () => {
  const v1 = commit(emptyState('e'), pass({ './a.ts': 'a1' }, ['react']))
  const v2 = commit(v1, pass({ './a.ts': 'a2' }, ['react', 'react-native-svg']))
  const requires = ['react', 'react-native-svg']

  assert.deepEqual(answer(v2, cursor(at('e', 1))), {
    kind: 'update',
    stamp: at('e', 2),
    modules: [['./a.ts', 'a2']],
    removed: [],
    requires,
  })
  assert.deepEqual(answer(v2, cursor(at('old', 1))), {
    kind: 'snapshot',
    stamp: at('e', 2),
    modules: [['./a.ts', 'a2']],
    requires,
  })
})

test('answer 는 아직 굽기를 하나도 넣지 않은 상태에서 붙든다. 빈 스냅숏이 기기 모듈을 지우지 않는다', () => {
  assert.equal(answer(emptyState('e'), cursor(at('old', 3))), undefined)
})

test('parseCursor 는 have · seen 둘 다 `<epoch>.<version>` 일 때만 커서를 낸다', () => {
  const parse = (query: string) => parseCursor(new URLSearchParams(query))

  assert.deepEqual(parse('have=mh3k2.1&seen=mh3k2.12'), {
    have: at('mh3k2', 1),
    seen: at('mh3k2', 12),
  })
  for (const query of [
    '',
    'have=e.1',
    'have=e.1&seen=e',
    'have=e.1&seen=.1',
    'have=e.-1&seen=e.1',
    'have=e.01&seen=e.1',
    'have=e.1.2&seen=e.1',
    'have=E.1&seen=e.1',
    'have=e.1&seen=e.99999999999999999999',
  ]) {
    assert.equal(parse(query), undefined, query)
  }
})

/** 굽기를 차례로 내는 세션. 다 쓰면 마지막 굽기를 되풀이한다 */
function sessionOf(...passes: PassResult[]) {
  let index = 0
  return createDevSession({
    name: 'settings',
    entry: './a.ts',
    epoch: 'e',
    compile: async () => passes[Math.min(index++, passes.length - 1)],
    runtime: async () => '',
    log: () => {},
  })
}

const PENDING = Symbol('pending')
const within = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([promise, new Promise<typeof PENDING>((r) => setTimeout(() => r(PENDING), ms))])

test('next 는 줄 것이 생길 때까지 붙들고, 상태를 바꾼 굽기가 깨운다', async () => {
  const session = sessionOf(
    pass({ './a.ts': 'a1' }),
    pass({ './a.ts': 'a1' }),
    pass({ './a.ts': 'a2' }),
  )
  await session.bundle('http://localhost:8082')

  const reply = session.next(cursor(at('e', 1)), 5000)
  assert.equal(await within(reply, 30), PENDING)

  session.changed()
  assert.equal(await within(reply, 30), PENDING, '바뀐 게 없는 굽기가 깨웠다')

  session.changed()
  assert.deepEqual(await reply, {
    kind: 'update',
    stamp: at('e', 2),
    modules: [['./a.ts', 'a2']],
    removed: [],
    requires: [],
  } satisfies Reply)
})

test('next 는 오류 굽기에 오류로 깨고, 그 오류를 본 커서는 고친 굽기가 깨운다', async () => {
  const session = sessionOf(pass({ './a.ts': 'a1' }), failed(syntax), pass({ './a.ts': 'a2' }))
  await session.bundle('http://localhost:8082')

  const error = session.next(cursor(at('e', 1)), 5000)
  session.changed()
  assert.deepEqual(await within(error, 1000), {
    kind: 'error',
    stamp: at('e', 2),
    errors: [syntax],
  } satisfies Reply)

  const fixed = session.next(cursor(at('e', 1), at('e', 2)), 5000)
  assert.equal(await within(fixed, 30), PENDING, '본 오류를 다시 냈다')
  session.changed()
  assert.deepEqual(await fixed, {
    kind: 'update',
    stamp: at('e', 3),
    modules: [['./a.ts', 'a2']],
    removed: [],
    requires: [],
  } satisfies Reply)
})

test('next 는 이미 줄 것이 있으면 바로 낸다', async () => {
  const session = sessionOf(pass({ './a.ts': 'a1' }))
  await session.bundle('http://localhost:8082')

  assert.deepEqual(await within(session.next(cursor(at('old', 9)), 5000), 30), {
    kind: 'snapshot',
    stamp: at('e', 1),
    modules: [['./a.ts', 'a1']],
    requires: [],
  })
})

test('next 는 timeoutMs 가 지나면 undefined 로 끝나고, close 는 붙든 요청을 전부 놓는다', async () => {
  const session = sessionOf(pass({ './a.ts': 'a1' }))
  await session.bundle('http://localhost:8082')

  assert.equal(await session.next(cursor(at('e', 1)), 20), undefined)

  const held = [session.next(cursor(at('e', 1)), 60_000), session.next(cursor(at('e', 1)), 60_000)]
  session.close()
  assert.deepEqual(await Promise.all(held), [undefined, undefined])
})

test('상태를 바꾼 굽기는 터미널에 버전과 바뀐 모듈을 한 줄로 남긴다', async () => {
  const lines: string[] = []
  const passes = [
    pass({ './a.ts': 'a1', './b.ts': 'b1', './c.ts': 'c1', './d.ts': 'd1' }),
    pass({ './a.ts': 'a1', './b.ts': 'b1', './c.ts': 'c1', './d.ts': 'd1' }),
    pass({ './a.ts': 'a2', './b.ts': 'b1', './c.ts': 'c1' }),
    failed(syntax),
  ]
  const session = createDevSession({
    name: 'settings',
    entry: './a.ts',
    epoch: 'e',
    compile: async () => passes.shift() ?? assert.fail('굽기를 더 불렀다'),
    runtime: async () => '',
    log: (line) => lines.push(line),
  })

  for (let n = 0; n < 4; n += 1) await session.bundle('http://localhost:8082')

  assert.equal(lines.length, 3, '바뀐 게 없는 굽기가 줄을 남겼다')
  assert.match(lines[0], /^v1 · 모듈 4개 · \d+ ms$/)
  assert.match(lines[1], /^v2 · a\.ts, d\.ts 지움 · \d+ ms$/)
  assert.match(lines[2], /^v3 · 굽지 못했다 · \d+ ms\nsrc\/a\.ts: Unexpected token \(3:1\)$/)
})
