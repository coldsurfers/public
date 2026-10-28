/**
 * dev 주소는 호스트와 미니앱 사이의 계약이다. 둘은 이 패키지를 따로 깔아서 버전이 갈릴 수 있고,
 * 한쪽만 주소 모양을 바꾸면 타입도 빌드도 못 잡은 채 기기에서 404 가 난다. 그래서 글자 그대로 박는다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDevResolver } from '../src/runtime/dev-resolver'

test('맡은 이름은 8082 의 /{name}/index.bundle.js 를 캐시 없이 받는다', async () => {
  const resolve = createDevResolver({ hostname: 'localhost', names: ['settings'] })

  assert.deepEqual(await resolve('settings'), {
    url: 'http://localhost:8082/settings/index.bundle.js',
    cache: false,
  })
})

test('Android 에뮬레이터 주소도 hostname 만 바뀐다', async () => {
  const resolve = createDevResolver({ hostname: '10.0.2.2', names: ['settings', 'profile'] })

  assert.deepEqual(await resolve('profile'), {
    url: 'http://10.0.2.2:8082/profile/index.bundle.js',
    cache: false,
  })
})

test('맡지 않은 이름은 다음 resolver 로 넘긴다', async () => {
  const resolve = createDevResolver({ hostname: 'localhost', names: ['settings'] })

  assert.equal(await resolve('profile'), undefined)
})

test('경로 한 칸에 못 쓰는 이름은 만들 때 던진다', () => {
  assert.throws(
    () => createDevResolver({ hostname: 'localhost', names: ['../settings'] }),
    /name 은 경로 한 칸이어야 한다/,
  )
})
