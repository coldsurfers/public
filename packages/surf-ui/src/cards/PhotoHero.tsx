import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../primitives'
import * as s from './PhotoHero.css'

/**
 * 사진 히어로 — 홈 첫 화면(Figma `831:2` · `838:2`). 늘 잉크 면이다.
 * 왼쪽 브랜드 칸은 위 라벨 → 워드마크 → 카피 → 아래 손글씨 + 라벨, 오른쪽 결정 칸은 `aside`.
 * 모바일은 같은 순서로 쌓인다.
 */
export interface PhotoHeroProps extends HTMLAttributes<HTMLElement> {
  /** 바닥 사진. 없으면 잉크 그라데이션 + 번짐으로 선다. */
  photoUrl?: string
  /** 워드마크 — 디자이너 SVG 를 꽂는다. 문자열이면 임시 글자로 그린다. */
  wordmark: ReactNode
  /** 세리프 카피 — `좋은 음악이\n있는 곳으로, 언제든.` */
  copy?: ReactNode
  /** 카피 아래 영문 한두 줄. */
  subcopy?: ReactNode
  /** 아래 왼쪽 손글씨 — SVG 를 꽂는다. */
  script?: ReactNode
  /** 위 귀퉁이 — 보통 `CornerLabel`. */
  topLabel?: ReactNode
  /** 아래 오른쪽 귀퉁이 — 보통 `CornerLabel`. */
  bottomLabel?: ReactNode
  /** 결정 칸 — 제목 · `PickCard` · 주 행동. 바로 아래 패널은 유리가 된다. */
  aside?: ReactNode
}

export function PhotoHero({
  photoUrl,
  wordmark,
  copy,
  subcopy,
  script,
  topLabel,
  bottomLabel,
  aside,
  className,
  ...rest
}: PhotoHeroProps) {
  return (
    <section data-surface="ink" className={cx(s.root, className)} {...rest}>
      {photoUrl ? (
        <img src={photoUrl} alt="" className={s.photo} />
      ) : (
        <div aria-hidden className={s.glow} />
      )}
      <div aria-hidden className={s.scrim} />
      <div className={s.inner}>
        <div className={s.brand}>
          {topLabel ?? <span />}
          <div className={s.middle}>
            <h1 className={s.wordmark}>{wordmark}</h1>
            {copy ? <p className={s.copy}>{copy}</p> : null}
            {subcopy ? <p className={s.subcopy}>{subcopy}</p> : null}
          </div>
          {script || bottomLabel ? (
            <div className={s.bottom}>
              <div className={s.script}>{script}</div>
              {bottomLabel}
            </div>
          ) : null}
        </div>
        {aside ? <div className={s.aside}>{aside}</div> : null}
      </div>
    </section>
  )
}
