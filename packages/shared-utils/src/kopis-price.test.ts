import { describe, expect, it } from 'vitest'
import { kopisPriceUtils } from './kopis-price'

describe('kopisPriceUtils.parse', () => {
  it('실데이터: 콤마로 나뉜 2등급 (예스24라이브홀 PF289925)', () => {
    expect(kopisPriceUtils.parse('지정석 143,000원, 스탠딩석 132,000원')).toEqual([
      { name: '지정석', price: 143000, currency: 'KRW' },
      { name: '스탠딩석', price: 132000, currency: 'KRW' },
    ])
  })

  it('3등급 (R/S/A석)', () => {
    expect(kopisPriceUtils.parse('R석 99,000원, S석 88,000원, A석 66,000원')).toEqual([
      { name: 'R석', price: 99000, currency: 'KRW' },
      { name: 'S석', price: 88000, currency: 'KRW' },
      { name: 'A석', price: 66000, currency: 'KRW' },
    ])
  })

  it('단일 등급', () => {
    expect(kopisPriceUtils.parse('전석 55,000원')).toEqual([
      { name: '전석', price: 55000, currency: 'KRW' },
    ])
  })

  it('등급명 없이 금액만 → 기본 등급 "전석"', () => {
    expect(kopisPriceUtils.parse('143,000원')).toEqual([
      { name: '전석', price: 143000, currency: 'KRW' },
    ])
  })

  it('콤마 없이 공백으로만 나열된 다등급', () => {
    expect(kopisPriceUtils.parse('VIP석 154,000원 R석 132,000원')).toEqual([
      { name: 'VIP석', price: 154000, currency: 'KRW' },
      { name: 'R석', price: 132000, currency: 'KRW' },
    ])
  })

  it('등급명에 숫자가 포함돼도 등급명·금액을 보존 (1층/2층)', () => {
    expect(kopisPriceUtils.parse('1층 50,000원, 2층 40,000원')).toEqual([
      { name: '1층', price: 50000, currency: 'KRW' },
      { name: '2층', price: 40000, currency: 'KRW' },
    ])
  })

  it('백만 단위 자릿수', () => {
    expect(kopisPriceUtils.parse('전석 1,100,000원')).toEqual([
      { name: '전석', price: 1100000, currency: 'KRW' },
    ])
  })

  it('무료 공연 → price 0 한 행', () => {
    expect(kopisPriceUtils.parse('무료')).toEqual([{ name: '전석', price: 0, currency: 'KRW' }])
    expect(kopisPriceUtils.parse('Free')).toEqual([{ name: '전석', price: 0, currency: 'KRW' }])
  })

  describe('fail-open — 금액 미상은 빈 배열', () => {
    it('빈/누락 입력', () => {
      expect(kopisPriceUtils.parse('')).toEqual([])
      expect(kopisPriceUtils.parse(null)).toEqual([])
      expect(kopisPriceUtils.parse(undefined)).toEqual([])
    })

    it('금액 없는 안내 문구 (초대·미정·전화문의)', () => {
      expect(kopisPriceUtils.parse('전석 초대')).toEqual([])
      expect(kopisPriceUtils.parse('가격 미정')).toEqual([])
      expect(kopisPriceUtils.parse('전화문의')).toEqual([])
    })

    it('한글 단위 표기("5만원")는 잘못된 값 대신 버린다', () => {
      expect(kopisPriceUtils.parse('5만원')).toEqual([])
    })
  })

  it('일부만 금액이면 금액 있는 세그먼트만 회수', () => {
    expect(kopisPriceUtils.parse('전석 30,000원, 현장구매 별도문의')).toEqual([
      { name: '전석', price: 30000, currency: 'KRW' },
    ])
  })
})
