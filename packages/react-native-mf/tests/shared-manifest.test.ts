/**
 * shared 매니페스트. **호스트 레지스트리 키가 정본**이고 치환 필터는 거기서 파생한다는 것을
 * 고정한다 — 파생이 깨지면 미니앱 번들에 사본이 조용히 들어간다.
 */
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  packageNameOf,
  parseSharedManifest,
  readSharedManifest,
  toSharedNames,
} from '../src/cli/shared-manifest'

test('스코프 패키지의 서브패스는 두 번째 세그먼트까지가 이름이다', () => {
  assert.equal(packageNameOf('react'), 'react')
  assert.equal(packageNameOf('react/jsx-runtime'), 'react')
  assert.equal(packageNameOf('react-native/Libraries/Text/Text'), 'react-native')
  assert.equal(packageNameOf('@coldsurfers/design-system'), '@coldsurfers/design-system')
  assert.equal(
    packageNameOf('@coldsurfers/design-system/native/Text'),
    '@coldsurfers/design-system',
  )
})

test('호스트 키에서 파생한 이름이 손으로 쓰던 목록과 같다', () => {
  // billets-app 의 실제 레지스트리 키 모양. 서브패스가 여럿인 패키지가 한 이름으로 접힌다.
  const hostKeys = [
    'react',
    'react/jsx-runtime',
    'react-native',
    '@tanstack/react-query',
    '@coldsurfers/design-system/native/Text',
    '@coldsurfers/design-system/native/Button',
    '@coldsurfers/design-system/tokens/native',
    '@coldsurfers/screens/AppScreen',
    '@coldsurfers/native-auth',
    '@coldsurfers/native-auth/client',
  ]

  assert.deepEqual(toSharedNames(hostKeys), [
    'react',
    'react-native',
    '@tanstack/react-query',
    '@coldsurfers/design-system',
    '@coldsurfers/screens',
    '@coldsurfers/native-auth',
  ])
})

test('중복은 접되 순서는 호스트가 쓴 순서를 지킨다', () => {
  assert.deepEqual(toSharedNames(['b', 'a/x', 'b/y', 'a']), ['b', 'a'])
})

test('배열이 아니거나 비어 있으면 파일 이름을 대며 던진다', () => {
  const path = '/tmp/shared.json'

  assert.throws(() => parseSharedManifest('{', path), /JSON 이 아니다.*shared\.json/s)
  assert.throws(() => parseSharedManifest('{"shared":[]}', path), /배열이어야 한다/)
  assert.throws(() => parseSharedManifest('[]', path), /비어 있다/)
  assert.throws(() => parseSharedManifest('["react", 1]', path), /문자열이 아닌 항목/)
  assert.throws(() => parseSharedManifest('["react", "  "]', path), /문자열이 아닌 항목/)
})

test('파일을 읽어 파생까지 한 번에 돌려준다', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rn-mf-manifest-'))
  const path = join(dir, 'shared-modules.json')
  await writeFile(path, JSON.stringify(['react', 'react/jsx-runtime', 'react-native']))

  assert.deepEqual(await readSharedManifest(path), ['react', 'react-native'])
})

test('없는 파일은 경로를 대며 던진다', async () => {
  await assert.rejects(
    () => readSharedManifest('/tmp/rn-mf-does-not-exist.json'),
    /읽을 수 없다.*rn-mf-does-not-exist\.json/s,
  )
})
