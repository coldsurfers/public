import type { ConcertCardBareProps, ConcertCardVariant } from '../contract'
import { CoverBlock, cx } from '../primitives'
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
/**
 * 공통분(`tone`·`initial`·`posterUrl`·`title`·`meta`·`footer`·`coverAction`·
 * `reserveTitleLines`)은 **계약에서 온다** — native 구현이 같은 인터페이스를 쓴다.
 * 여기 적는 건 **웹에만 있는 것**뿐이다.
 */
export interface ConcertCardProps extends ConcertCardBareProps {
  /** 취향 매치 라벨 — `96% 취향`. 없으면 미노출. **`framed` 전용** (시안의 `bare` 엔 자리가 없다). */
  matchLabel?: string
  /** 커버 좌상단 mono 라벨 — 시안의 장르 자리(`INDIE ROCK`). 없으면 미노출. **`cover` 전용**. */
  eyebrow?: string
  /**
   * `framed`(기본) — 테두리·배경 있는 액자 카드(`/live-events`·`/nearby`·`/gig-guide`).
   * `bare` — 시안 dice.fm 리스킨(Figma `931:32`·`931:259`): 섀시 없이 4:3 포스터 블록 + 그 아래 3줄
   * 텍스트. `/`(트렌딩 레일)·`/@<handle>`(담은 공연 그리드)이 쓴다.
   * `cover` — 시안 날짜 피드 리스킨(Figma `1093:171`·`1093:576`): 세로 커버 한 장에 eyebrow·담기·
   * 제목을 **얹고** 커버 아래엔 메타 1줄. `/live-events/new` 와 그 날짜 상세가 쓴다.
   *
   * ⚠️ native 는 `bare` 만 구현한다 — 그래서 그쪽엔 이 prop 이 아예 없다.
   */
  variant?: ConcertCardVariant
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
