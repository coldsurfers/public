import { describe, expect, it } from 'vitest'
import { normalizeEmail } from './email'

describe('normalizeEmail', () => {
  it('trim + lowercase', () => {
    expect(normalizeEmail('  Someone@Gmail.com  ')).toBe('someone@gmail.com')
  })

  it('로컬파트 +alias 제거', () => {
    expect(normalizeEmail('someone+coldsurf@gmail.com')).toBe('someone@gmail.com')
  })

  it('+alias·대소문자 동시 정규화 (같은 Contact 로 수렴)', () => {
    expect(normalizeEmail('Someone+Tag1@Gmail.com')).toBe('someone@gmail.com')
    expect(normalizeEmail('someone+tag2@gmail.com')).toBe('someone@gmail.com')
  })

  it('dot 은 보존 (전 도메인 일괄 제거 위험)', () => {
    expect(normalizeEmail('first.last@gmail.com')).toBe('first.last@gmail.com')
  })

  it('도메인쪽 + 는 건드리지 않음 (로컬파트만)', () => {
    expect(normalizeEmail('user@sub+domain.com')).toBe('user@sub+domain.com')
  })

  it('@ 없는/비정상 입력은 trim+lowercase 만', () => {
    expect(normalizeEmail('  NOtAnEmail ')).toBe('notanemail')
    expect(normalizeEmail('@leading.com')).toBe('@leading.com')
  })
})
