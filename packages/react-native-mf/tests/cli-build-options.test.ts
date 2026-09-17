/**
 * 플래그 해석. **esbuild·babel 없이 판정되는 자리**라 따로 둔다 — 필수 옵션이 빠진 실행은
 * 빌드 도구를 열기 전에 끝나야 하고, 그게 optional peer 를 늦게 여는 설계의 값이다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseBuildOptions } from '../src/cli/build-options'

const cwd = '/tmp/mini-app'

function parse(argv: string[]) {
  return parseBuildOptions(argv, cwd)
}

test('필수는 --out-file 과 --name 둘이다', () => {
  assert.deepEqual(parse([]), { ok: false, error: '-o, --out-file 이 필요하다' })
  assert.deepEqual(parse(['-o', 'a.js']), { ok: false, error: '-n, --name 이 필요하다' })

  const parsed = parse(['-o', 'a.js', '-n', 'settings'])
  assert.ok(parsed.ok)
  assert.equal(parsed.options.outFile, 'a.js')
  assert.equal(parsed.options.name, 'settings')
})

test('기본값은 플러그인과 같은 shared 목록이다', () => {
  const parsed = parse(['-o', 'a.js', '-n', 'settings'])

  assert.ok(parsed.ok)
  assert.deepEqual([...parsed.options.shared], ['react', 'react-native'])
  assert.equal(parsed.options.src, 'src')
  assert.equal(parsed.options.entry, 'index.ts')
  assert.equal(parsed.options.blockScoping, true)
  assert.equal(parsed.options.cwd, cwd)
})

test('--shared 는 반복도 쉼표도 받는다', () => {
  // 18개짜리 목록을 한 줄에 쓸 수 있어야 한다. 패키지 이름에 쉼표가 못 들어가서 갈라도 안전하다.
  const parsed = parse([
    '-o',
    'a.js',
    '-n',
    'settings',
    '--shared',
    'react,react-native',
    '--shared=@gorhom/bottom-sheet',
  ])

  assert.ok(parsed.ok)
  assert.deepEqual(
    [...parsed.options.shared],
    ['react', 'react-native', '@gorhom/bottom-sheet'],
    '기본 목록이 넘긴 목록을 덮으면 안 된다',
  )
})

test('--no-block-scoping 은 후처리를 끈다', () => {
  const parsed = parse(['-o', 'a.js', '-n', 'settings', '--no-block-scoping'])

  assert.ok(parsed.ok)
  assert.equal(parsed.options.blockScoping, false)
})

test('값이 빠진 플래그가 다음 플래그를 삼키지 않는다', () => {
  // `--name -o a.js` 를 그대로 두면 name 이 "-o" 가 되고, 빌드는 그 이름으로 성공한다 —
  // 호스트가 회수에서야 터진다.
  assert.deepEqual(parse(['-o', 'a.js', '--name', '-n', 'x']), {
    ok: false,
    error: '"--name" 에 값이 없다',
  })
})

test('모르는 플래그는 삼키지 않고 끊는다', () => {
  assert.deepEqual(parse(['-o', 'a.js', '-n', 'x', '--minify']), {
    ok: false,
    error: '알 수 없는 옵션 "--minify"',
  })
})

test('--shared-from 은 경로만 물고 목록은 비워 둔다', () => {
  // 매니페스트를 읽는 건 I/O 라 파서가 안 한다. `run` 이 읽어 `shared` 를 덮는다.
  const parsed = parse(['-o', 'a.js', '-n', 'settings', '--shared-from', '../host/shared.json'])

  assert.ok(parsed.ok)
  assert.equal(parsed.sharedFrom, '../host/shared.json')
  assert.deepEqual([...parsed.options.shared], ['react', 'react-native'])
})

test('--shared 와 --shared-from 은 같이 못 쓴다', () => {
  assert.deepEqual(
    parse(['-o', 'a.js', '-n', 'settings', '--shared', 'react', '--shared-from', 'a.json']),
    {
      ok: false,
      error: '--shared 와 --shared-from 은 같이 쓸 수 없다',
    },
  )

  // 순서가 반대여도 같다.
  assert.deepEqual(
    parse(['-o', 'a.js', '-n', 'settings', '--shared-from=a.json', '--shared=react']),
    {
      ok: false,
      error: '--shared 와 --shared-from 은 같이 쓸 수 없다',
    },
  )
})

test('--shared-from 을 안 쓰면 sharedFrom 이 없다', () => {
  const parsed = parse(['-o', 'a.js', '-n', 'settings'])

  assert.ok(parsed.ok)
  assert.equal(parsed.sharedFrom, undefined)
})
