import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dateUtils } from './date'

describe('dateUtils', () => {
  describe('parseEventDate', () => {
    beforeEach(() => {
      // "now"를 2025-06-01로 고정하여 same-year / different-year 분기를 결정론적으로 테스트
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('한국어 포맷: 같은 해, 정각(분 없음)', () => {
      // 2025-03-15 14:00 KST = 2025-03-15T05:00:00Z
      const date = new Date('2025-03-15T05:00:00Z')
      expect(dateUtils.parseEventDate(date)).toBe('토요일 오후 2시, 3월 15일')
    })

    it('한국어 포맷: 같은 해, 분 포함', () => {
      // 2025-03-15 14:30 KST = 2025-03-15T05:30:00Z
      const date = new Date('2025-03-15T05:30:00Z')
      expect(dateUtils.parseEventDate(date)).toBe('토요일 오후 2시 30분, 3월 15일')
    })

    it('한국어 포맷: 다른 해, 분 포함', () => {
      // 2024-03-02 14:30 KST = 2024-03-02T05:30:00Z (2024 ≠ 2025)
      const date = new Date('2024-03-02T05:30:00Z')
      expect(dateUtils.parseEventDate(date)).toBe('토요일 오후 2시 30분, 2024년 3월 2일')
    })

    it('한국어 포맷: 다른 해, 정각(분 없음)', () => {
      // 2024-03-02 14:00 KST = 2024-03-02T05:00:00Z
      const date = new Date('2024-03-02T05:00:00Z')
      expect(dateUtils.parseEventDate(date)).toBe('토요일 오후 2시, 2024년 3월 2일')
    })

    it('영어 포맷: 같은 해', () => {
      // 2025-03-15 14:30 KST = 2025-03-15T05:30:00Z
      const date = new Date('2025-03-15T05:30:00Z')
      expect(dateUtils.parseEventDate(date, { formatStyle: 'english' })).toBe('Mar 15, 2:30 PM')
    })

    it('영어 포맷: 다른 해', () => {
      // 2024-03-02 14:30 KST = 2024-03-02T05:30:00Z
      const date = new Date('2024-03-02T05:30:00Z')
      expect(dateUtils.parseEventDate(date, { formatStyle: 'english' })).toBe(
        'Mar 02, 2024, 2:30 PM',
      )
    })
  })

  describe('toUTCDayRangeFromYYYYMMDD', () => {
    it('KST 자정 → UTC 범위 반환 (20250101)', () => {
      // KST 2025-01-01 00:00 = UTC 2024-12-31 15:00
      // KST 2025-01-02 00:00 = UTC 2025-01-01 15:00
      const [utcStart, utcEnd] = dateUtils.toUTCDayRangeFromYYYYMMDD({
        yyyymmdd: '20250101',
      })
      expect(utcStart.toISOString()).toBe('2024-12-31T15:00:00.000Z')
      expect(utcEnd.toISOString()).toBe('2025-01-01T15:00:00.000Z')
    })

    it('KST 자정 → UTC 범위 반환 (20250315)', () => {
      // KST 2025-03-15 00:00 = UTC 2025-03-14 15:00
      const [utcStart, utcEnd] = dateUtils.toUTCDayRangeFromYYYYMMDD({
        yyyymmdd: '20250315',
      })
      expect(utcStart.toISOString()).toBe('2025-03-14T15:00:00.000Z')
      expect(utcEnd.toISOString()).toBe('2025-03-15T15:00:00.000Z')
    })

    it('잘못된 포맷(하이픈)은 에러 throw', () => {
      expect(() => dateUtils.toUTCDayRangeFromYYYYMMDD({ yyyymmdd: '2025-01-01' })).toThrow(
        'Invalid date format. Expected YYYYMMDD',
      )
    })

    it('잘못된 포맷(자릿수 부족)은 에러 throw', () => {
      expect(() => dateUtils.toUTCDayRangeFromYYYYMMDD({ yyyymmdd: '2025010' })).toThrow(
        'Invalid date format. Expected YYYYMMDD',
      )
    })

    it('잘못된 포맷(비숫자)은 에러 throw', () => {
      expect(() => dateUtils.toUTCDayRangeFromYYYYMMDD({ yyyymmdd: 'abcdefgh' })).toThrow(
        'Invalid date format. Expected YYYYMMDD',
      )
    })
  })

  describe('getWeekendUTCStartDates', () => {
    it('항상 FRIDAY / SATURDAY / SUNDAY 3개 범위 반환', () => {
      const result = dateUtils.getWeekendUTCStartDates({
        yyyymmdd: '20250101',
      })
      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('FRIDAY')
      expect(result[1].label).toBe('SATURDAY')
      expect(result[2].label).toBe('SUNDAY')
    })

    it('수요일 기준: 해당 주 금/토/일 UTC 범위 반환', () => {
      // 2025-01-01(수) → 금요일 = 2025-01-03
      // KST 2025-01-03 00:00 = UTC 2025-01-02 15:00
      const result = dateUtils.getWeekendUTCStartDates({
        yyyymmdd: '20250101',
      })

      expect(result[0].utcStart.toISOString()).toBe('2025-01-02T15:00:00.000Z')
      expect(result[0].utcEnd.toISOString()).toBe('2025-01-03T15:00:00.000Z')

      expect(result[1].utcStart.toISOString()).toBe('2025-01-03T15:00:00.000Z')
      expect(result[1].utcEnd.toISOString()).toBe('2025-01-04T15:00:00.000Z')

      expect(result[2].utcStart.toISOString()).toBe('2025-01-04T15:00:00.000Z')
      expect(result[2].utcEnd.toISOString()).toBe('2025-01-05T15:00:00.000Z')
    })

    it('금요일 기준: offset 0 → 같은 금요일 반환', () => {
      // 2025-01-03 = 금요일, diffToFriday = 0
      const result = dateUtils.getWeekendUTCStartDates({
        yyyymmdd: '20250103',
      })
      expect(result[0].utcStart.toISOString()).toBe('2025-01-02T15:00:00.000Z')
    })

    it('토요일 기준: offset 6 → 다음 주 금요일 반환', () => {
      // 2025-01-04(토), diffToFriday = 6 → 금요일 = 2025-01-10
      // KST 2025-01-10 00:00 = UTC 2025-01-09 15:00
      const result = dateUtils.getWeekendUTCStartDates({
        yyyymmdd: '20250104',
      })
      expect(result[0].utcStart.toISOString()).toBe('2025-01-09T15:00:00.000Z')
    })

    it('일요일 기준: offset 5 → 같은 주 금요일 반환', () => {
      // 2025-01-05(일), getDay=0, diffToFriday = (5-0+7)%7 = 5 → 금요일 = 2025-01-10
      const result = dateUtils.getWeekendUTCStartDates({
        yyyymmdd: '20250105',
      })
      expect(result[0].utcStart.toISOString()).toBe('2025-01-09T15:00:00.000Z')
    })

    it('파라미터 없이 호출 가능 (현재 날짜 기준)', () => {
      const result = dateUtils.getWeekendUTCStartDates()
      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('FRIDAY')
    })
  })
})
