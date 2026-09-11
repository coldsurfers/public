'use client'
import { sprinkles } from '@coldsurfers/design-system/sprinkles'

const SENTENCE = '서울의 공연을 하나의 지면에서 발견합니다'

export default function Example() {
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%' }}>
      {/* 본문 — 한글은 0 에 두면 헐렁하다. 같은 문장을 두 줄로 나란히 둬야 차이가 보인다. */}
      <div style={{ display: 'grid', gap: 6 }}>
        <p className={sprinkles({ fontSize: 'base', color: 'body', letterSpacing: 'none' })}>
          {SENTENCE}
        </p>
        <p className={sprinkles({ fontSize: 'base', color: 'body', letterSpacing: 'normal' })}>
          {SENTENCE}
        </p>
        <span className={sprinkles({ fontSize: '2xs', fontFamily: 'mono', color: 'muted' })}>
          위 none · 아래 normal
        </span>
      </div>

      {/* 헤드라인 — 큰 글자는 더 조여야 같은 무게로 읽힌다. */}
      <h3
        className={sprinkles({
          fontSize: '3xl',
          fontWeight: 'semibold',
          color: 'strong',
          lineHeight: 'tight',
          letterSpacing: 'tight',
        })}
      >
        이번 주말, 홍대
      </h3>

      {/* mono — 격자가 곧 리듬이라 조이지 않는다. */}
      <code className={sprinkles({ fontSize: 'sm', fontFamily: 'mono', letterSpacing: 'none' })}>
        2026-09-11 · 21:00 · KRW 25,000
      </code>
    </div>
  )
}
