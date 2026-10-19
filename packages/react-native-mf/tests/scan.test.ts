/**
 * 진짜 키처럼 보이는 문자열을 레포에 두지 않으려고 값은 이어 붙여 만든다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatFindings, scanBundle } from '../src/deploy/scan'

const awsKey = `AKIA${'Q'.repeat(16)}`
const googleKey = `AIza${'x'.repeat(35)}`

test('형식이 뚜렷한 키를 줄 · 칸과 함께 잡는다', () => {
  const findings = scanBundle(`var a = 1;\nvar k = "${awsKey}";`)
  assert.deepEqual(findings, [
    { rule: 'aws-access-key-id', line: 2, column: 10, preview: 'AKIA…(20자)' },
  ])
})

test('본문이 붙은 개인 키와 여러 종류를 함께 잡는다', () => {
  const pem = `-----BEGIN RSA ${'PRIVATE'} KEY-----\\n${'M'.repeat(64)}`
  const code = [`"${pem}"`, `"${googleKey}"`].join('\n')
  assert.deepEqual(
    scanBundle(code).map((finding) => finding.rule),
    ['private-key', 'google-api-key'],
  )
})

test('PEM 머리 상수만 있으면 잡지 않는다', () => {
  assert.deepEqual(scanBundle(`var H = "-----BEGIN ${'PRIVATE'} KEY-----";`), [])
})

test('끝 글자가 - 나 _ 인 Google 키도 잡는다', () => {
  for (const last of ['-', '_']) {
    const key = `AIza${'x'.repeat(34)}${last}`
    assert.deepEqual(
      scanBundle(`"${key}"`).map((finding) => finding.rule),
      ['google-api-key'],
      `끝 글자 ${last}`,
    )
  }
})

test('allow 에 적은 값은 통과한다', () => {
  assert.deepEqual(scanBundle(`"${googleKey}"`, [googleKey]), [])
})

test('키가 없는 번들은 비어 있다', () => {
  assert.deepEqual(scanBundle('var AKIA = "short"; const ghp_x = 1;'), [])
})

test('메시지에 값 전체를 다시 싣지 않는다', () => {
  const message = formatFindings('out.js', scanBundle(`"${awsKey}"`))
  assert.ok(!message.includes(awsKey), '키 전체가 메시지에 남았다')
  assert.match(message, /aws-access-key-id {2}1:2 {2}AKIA…\(20자\)/)
})
