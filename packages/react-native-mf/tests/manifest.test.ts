import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  addRelease,
  bundleKey,
  emptyManifest,
  type Manifest,
  manifestKey,
  parseManifest,
  type Release,
  rollback,
} from '../src/manifest'

const release = (version: string, enabled = true): Release => ({
  version,
  requires: ['react'],
  enabled,
  deployedAt: '2026-10-19T00:00:00.000Z',
})

const live = (manifest: Manifest) =>
  manifest.releases.filter((item) => item.enabled).map((item) => item.version)

test('키는 앞뒤 슬래시를 접고 채널 · 버전 자리를 가른다', () => {
  assert.equal(
    manifestKey('/billets/apps/', 'settings', 'staging'),
    'billets/apps/settings/staging/manifest.json',
  )
  assert.equal(bundleKey('', 'settings', '1.2.0'), 'settings/1.2.0/index.bundle.js')
})

test('경로를 접는 채널 · 버전 · prefix 는 거절한다', () => {
  assert.throws(() => manifestKey('apps', 'settings', '../production'), /channel 은 경로 한 칸/)
  assert.throws(() => manifestKey('apps', 'settings', 'staging/x'), /channel 은 경로 한 칸/)
  assert.throws(() => bundleKey('apps', 'settings', '..'), /version 은 경로 한 칸/)
  assert.throws(() => bundleKey('apps/../other', 'settings', '1.2.0'), /prefix 은 경로 한 칸/)
  assert.equal(
    bundleKey('apps', 'settings', '1.2.0-beta.1'),
    'apps/settings/1.2.0-beta.1/index.bundle.js',
  )
})

test('새 릴리스가 앞에 붙고, 같은 버전은 거절한다', () => {
  const once = addRelease(emptyManifest('settings'), release('1.2.0'))
  const twice = addRelease(once, release('1.2.1'))
  assert.deepEqual(live(twice), ['1.2.1', '1.2.0'])
  assert.throws(() => addRelease(twice, release('1.2.0')), /이미 이 채널에 있다/)
})

test('되돌리기는 켜진 최신을 끄고, 이미 꺼진 것은 건너뛴다', () => {
  const manifest = { name: 'settings', releases: [release('3'), release('2', false), release('1')] }
  assert.deepEqual(live(rollback(manifest)), ['1'])
})

test('--to 는 그보다 새 것을 끄고 대상을 켠다 — 다시 돌려도 같다', () => {
  const manifest = { name: 'settings', releases: [release('3'), release('2', false), release('1')] }
  const once = rollback(manifest, '2')
  assert.deepEqual(live(once), ['2', '1'])
  assert.deepEqual(rollback(once, '2'), once)
})

test('켜진 릴리스가 하나뿐이거나 대상이 없으면 거절한다', () => {
  const single = { name: 'settings', releases: [release('1')] }
  assert.throws(() => rollback(single), /이전 릴리스가 없다/)
  assert.throws(() => rollback(single, '9'), /이 채널에 없다/)
})

test('모양이 틀린 매니페스트는 어디서 왔는지 대며 던진다', () => {
  assert.throws(() => parseManifest('{', 'k'), /JSON 이 아니다: k/)
  assert.throws(() => parseManifest('{"name":"s"}', 'k'), /name · releases/)
  assert.throws(
    () => parseManifest('{"name":"s","releases":[{"version":"1"}]}', 'k'),
    /릴리스 모양이 틀렸다/,
  )
  const ok = { name: 's', releases: [release('1')] }
  assert.deepEqual(parseManifest(JSON.stringify(ok), 'k'), ok)
})
