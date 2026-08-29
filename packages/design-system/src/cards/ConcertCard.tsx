import type { ReactNode } from 'react'
import { CoverBlock, cx } from '../primitives'
import type { CoverTone } from '../tokens'
import * as s from './ConcertCard.css'

/**
 * 공연 카드 — 시안 라이브 표면(Figma 585-126). 커버(포스터 or tone·이니셜) + 본문(title·meta·footer).
 * router 비의존 — 클릭은 소비처가 `Link` 로 감싼다. 높이는 내용 기준(고정 없음).
 *
 * 커버는 두 모드다: `posterUrl` 이 있으면 실제 포스터를 채우고(실데이터 표면),
 * 없으면 tone 색면 + 대형 이니셜(시안 mock). 실 이벤트에는 포스터를, 데모엔 이니셜을.
 *
 * `footer` = 시안의 MatchWhy 슬롯 — 매칭 근거(아티스트명 + 장르 태그) 를 카드 body 안(meta 아래)에.
 *
 * 섀시는 세 벌이다 — `variant` 참고.
 */
export interface ConcertCardProps {
  tone: CoverTone
  /** 커버 대형 이니셜(자모). `posterUrl` 없을 때만 노출. `cover` 는 제목이 이미 커버 위라 안 쓴다. */
  initial: string
  /** 실제 포스터 URL. 있으면 tone·이니셜 대신 포스터가 커버를 채운다. */
  posterUrl?: string | null
  /** 취향 매치 라벨 — `96% 취향`. 없으면 미노출. **`framed` 전용** (시안의 `bare` 엔 자리가 없다). */
  matchLabel?: string
  /** 커버 좌상단 mono 라벨 — 시안의 장르 자리(`INDIE ROCK`). 없으면 미노출. **`cover` 전용**. */
  eyebrow?: string
  title: string
  /** `롤링홀 · 서울 · 7.24 금`. */
  meta: string
  /** meta 아래 슬롯(시안 MatchWhy) — 매칭 근거 줄 등. 없으면 미노출. `cover` 엔 자리가 없다. */
  footer?: ReactNode
  /**
   * 커버 액션 슬롯 — 시안 `btn/save`. `framed`·`bare` 는 **우하단**, `cover` 는 시안대로 **우상단**.
   * 자리·정렬만 카드가 정하고 내용물(버튼)은 소비처가 준다.
   * 카드 전체가 `Link` 안이면 소비처 버튼이 `preventDefault` 로 내비를 막아야 한다.
   */
  coverAction?: ReactNode
  /**
   * `framed`(기본) — 테두리·배경 있는 액자 카드(`/live-events`·`/nearby`·`/gig-guide`).
   * `bare` — 시안 dice.fm 리스킨(Figma `931:32`·`931:259`): 섀시 없이 4:3 포스터 블록 + 그 아래 3줄
   * 텍스트. `/`(트렌딩 레일)·`/@<handle>`(담은 공연 그리드)이 쓴다.
   * `cover` — 시안 날짜 피드 리스킨(Figma `1093:171`·`1093:576`): 세로 커버 한 장에 eyebrow·담기·
   * 제목을 **얹고** 커버 아래엔 메타 1줄. `/live-events/new` 와 그 날짜 상세가 쓴다.
   */
  variant?: 'framed' | 'bare' | 'cover'
  /**
   * 제목 **2줄 높이를 예약**한다 (`bare` 전용, 기본 off).
   *
   * 켜는 자리 = **그리드** — 카드가 가로로 줄지어 서므로, 제목 줄 수가 다른 이웃끼리 날짜·공연장
   * 줄이 어긋난다. 예약하면 그 줄들이 행 단위로 정렬된다.
   * 끄는 자리 = **레일** — 시안(`931:84`)이 1줄 제목 기준이라, 예약하면 제목 아래 빈 줄이 생겨
   * 시안과 어긋난다. 가로 스크롤이라 정렬 이득도 그리드만 못하다.
   *
   * `framed` 는 자체 `minHeight` 로 항상 예약하므로 이 prop 을 보지 않는다.
   */
  reserveTitleLines?: boolean
  className?: string
}

export function ConcertCard({
  tone,
  initial,
  posterUrl,
  matchLabel,
  eyebrow,
  title,
  meta,
  footer,
  coverAction,
  variant = 'framed',
  reserveTitleLines = false,
  className,
}: ConcertCardProps) {
  if (variant === 'cover') {
    return (
      <article className={cx(s.coverRoot, className)}>
        <CoverBlock tone={tone} className={s.coverCover}>
          {posterUrl ? (
            <img src={posterUrl} alt="" loading="lazy" className={s.coverImage} />
          ) : null}
          <div className={s.coverScrim} />
          {/* 두 자리 중 하나만 있어도 반대쪽이 제자리를 지키도록 빈 span 을 남긴다. */}
          <div className={s.coverTopRow}>
            {eyebrow ? <span className={s.coverEyebrow}>{eyebrow}</span> : <span />}
            {coverAction}
          </div>
          <h3 className={s.coverTitle}>{title}</h3>
        </CoverBlock>
        <p className={s.coverMeta}>{meta}</p>
      </article>
    )
  }

  if (variant === 'bare') {
    return (
      <article className={cx(s.bareRoot, className)}>
        <CoverBlock tone={tone} className={s.bareCover}>
          {posterUrl ? (
            <img src={posterUrl} alt="" loading="lazy" className={s.coverImage} />
          ) : (
            <span className={s.bareInitial}>{initial}</span>
          )}
          {coverAction ? <div className={s.bareCoverAction}>{coverAction}</div> : null}
        </CoverBlock>
        {/* 시안 meta — 제목(strong) / 날짜(text) / 공연장(footer, muted) 3줄. */}
        <div className={s.bareMeta}>
          <h3 className={s.bareTitle({ reserve: reserveTitleLines })}>{title}</h3>
          <p className={s.bareLine}>{meta}</p>
          {footer}
        </div>
      </article>
    )
  }

  return (
    <article className={cx(s.framedRoot, className)}>
      <CoverBlock tone={tone} className={s.framedCover}>
        {posterUrl ? <img src={posterUrl} alt="" loading="lazy" className={s.coverImage} /> : null}
        {matchLabel ? (
          <span className={s.framedMatch}>
            <span className={s.framedMatchDot} />
            {matchLabel}
          </span>
        ) : (
          <span />
        )}
        {posterUrl ? <span /> : <span className={s.framedInitial}>{initial}</span>}
        {coverAction ? <div className={s.framedCoverAction}>{coverAction}</div> : null}
      </CoverBlock>
      <div className={s.framedBody}>
        <h3 className={s.framedTitle}>{title}</h3>
        <p className={s.framedMeta}>{meta}</p>
        {footer}
      </div>
    </article>
  )
}
