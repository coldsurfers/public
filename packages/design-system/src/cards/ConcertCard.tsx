import type { ConcertCardBareProps, ConcertCardVariant } from '../contract'
import { CoverBlock, cx } from '../primitives'
import * as s from './ConcertCard.css'

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

/**
 * 공연 카드 — 시안 라이브 표면(Figma 585-126). 커버(포스터 or tone·이니셜) + 본문(title·meta·footer).
 * router 비의존 — 클릭은 소비처가 `Link` 로 감싼다. 높이는 내용 기준(고정 없음).
 *
 * 커버는 두 모드다: `posterUrl` 이 있으면 실제 포스터를 채우고(실데이터 표면),
 * 없으면 tone 색면 + 대형 이니셜(시안 mock). 실 이벤트에는 포스터를, 데모엔 이니셜을.
 *
 * `footer` = 시안의 MatchWhy 슬롯 — 매칭 근거(아티스트명 + 장르 태그) 를 카드 body 안(meta 아래)에.
 *
 * ## 섀시 셋은 컴포넌트 셋이다
 *
 * `variant` 는 **문 하나**고, 그 뒤엔 마크업을 공유하지 않는 세 컴포넌트가 있다. 한 함수 안의
 * `if` 셋으로 두면 세 섀시의 props 가 한 목록으로 뭉뚱그려져 *어느 축이 어느 섀시의 것인지*를
 * 주석만 말하게 된다(`matchLabel` 은 `framed` 전용, `eyebrow` 는 `cover` 전용이었다).
 * 나누면 그걸 `Pick` 이 말한다 — 타입이 곧 그 섀시가 받는 것의 전부다.
 *
 * **`variant` 를 `ConcertCard.Bare` 같은 정적 프로퍼티로 바꾸지 않은 이유**: 이 축은
 * `contract/concert-card.ts` 의 `ConcertCardVariant` 이고 native 레인이 같은 계약을 읽는다.
 * 발행 중인 패키지라 문 이름을 바꾸면 그 순간 major 다 — 안쪽 구조는 계약이 아니지만 문은 계약이다.
 */
export function ConcertCard({ variant = 'framed', ...props }: ConcertCardProps) {
  if (variant === 'cover') return <CoverCard {...props} />
  if (variant === 'bare') return <BareCard {...props} />
  return <FramedCard {...props} />
}

/**
 * 커버를 채우는 실제 포스터. 세 섀시가 글자 그대로 같은 한 장을 쓴다 —
 * 채우기(`objectFit: cover`)와 지연 로딩이 섀시별로 달라질 축이 아니다.
 *
 * `alt=""` 는 장식이라는 선언이다. 공연 정보는 옆 텍스트가 이미 말하므로 포스터를 한 번 더
 * 읽히면 같은 말을 두 번 한다.
 */
function CoverImage({ src }: { src?: string | null }) {
  return src ? <img src={src} alt="" loading="lazy" className={s.coverImage} /> : null
}

type FramedCardProps = Pick<
  ConcertCardProps,
  | 'tone'
  | 'initial'
  | 'posterUrl'
  | 'matchLabel'
  | 'title'
  | 'meta'
  | 'footer'
  | 'coverAction'
  | 'className'
>

/**
 * 액자 섀시 — 테두리·배경이 있는 기본 카드.
 *
 * 커버 안의 세로 배치는 `framedInitial` 의 `marginTop: auto` 가 만든다. 매치 라벨과 이니셜은
 * 서로를 필요로 하지 않으므로 둘 다 자기 자리를 스스로 잡는다.
 *
 * ⚠️ 제목 2줄 예약은 이 섀시가 `framedTitle` 의 `minHeight` 로 **항상** 한다 —
 * 그래서 `reserveTitleLines` 를 받지 않는다(`contract/concert-card.ts`).
 */
function FramedCard({
  tone,
  initial,
  posterUrl,
  matchLabel,
  title,
  meta,
  footer,
  coverAction,
  className,
}: FramedCardProps) {
  return (
    <article className={cx(s.framedRoot, className)}>
      <CoverBlock tone={tone} className={s.framedCover}>
        <CoverImage src={posterUrl} />
        {matchLabel ? (
          <span className={s.framedMatch}>
            <span className={s.framedMatchDot} />
            {matchLabel}
          </span>
        ) : null}
        {posterUrl ? null : <span className={s.framedInitial}>{initial}</span>}
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

type BareCardProps = Pick<
  ConcertCardProps,
  | 'tone'
  | 'initial'
  | 'posterUrl'
  | 'title'
  | 'meta'
  | 'footer'
  | 'coverAction'
  | 'coverRatio'
  | 'reserveTitleLines'
  | 'className'
>

/**
 * 민짜 섀시 — 섀시 없이 포스터 블록 + 그 아래 3줄 텍스트(제목 / 날짜 / 공연장).
 * 치수는 `CONCERT_CARD_BARE_SPEC` 이 정본이고 native 구현이 같은 표를 읽는다.
 */
function BareCard({
  tone,
  initial,
  posterUrl,
  title,
  meta,
  footer,
  coverAction,
  coverRatio = 'landscape',
  reserveTitleLines = false,
  className,
}: BareCardProps) {
  return (
    <article className={cx(s.bareRoot, className)}>
      <CoverBlock tone={tone} className={cx(s.bareCover, s.bareCoverRatio[coverRatio])}>
        {posterUrl ? (
          <CoverImage src={posterUrl} />
        ) : (
          <span className={s.bareInitial}>{initial}</span>
        )}
        {coverAction ? <div className={s.bareCoverAction}>{coverAction}</div> : null}
      </CoverBlock>
      {/* 시안 meta — 제목(strong) / 날짜(mono·muted) / 공연장(footer, muted) 3줄. */}
      <div className={s.bareMeta}>
        <h3 className={s.bareTitle({ reserve: reserveTitleLines })}>{title}</h3>
        <p className={s.bareLine}>{meta}</p>
        {footer}
      </div>
    </article>
  )
}

type CoverCardProps = Pick<
  ConcertCardProps,
  'tone' | 'posterUrl' | 'eyebrow' | 'title' | 'meta' | 'coverAction' | 'className'
>

/**
 * 커버 섀시 — 세로 커버 한 장에 eyebrow·담기·제목을 얹고, 커버 아래 메타 1줄.
 *
 * 위 줄의 좌우 배치는 `coverTopAction` 의 `marginInlineStart: auto` 가 만든다. eyebrow 가
 * 없어도 담기 버튼은 제자리(우)를 지킨다 — 자리를 채우려고 빈 노드를 넣지 않는다.
 *
 * ⚠️ 이 섀시엔 `initial` 자리가 없다. 포스터가 없으면 tone 색면만 남는다 —
 * 430px 세로 커버에 이니셜 한 자를 띄우면 mock 티가 나고, 이 지면은 실데이터 면이다.
 */
function CoverCard({
  tone,
  posterUrl,
  eyebrow,
  title,
  meta,
  coverAction,
  className,
}: CoverCardProps) {
  return (
    <article className={cx(s.coverRoot, className)}>
      <CoverBlock tone={tone} className={s.coverCover}>
        <CoverImage src={posterUrl} />
        <div className={s.coverScrim} />
        <div className={s.coverTopRow}>
          {eyebrow ? <span className={s.coverEyebrow}>{eyebrow}</span> : null}
          {coverAction ? <div className={s.coverTopAction}>{coverAction}</div> : null}
        </div>
        <h3 className={s.coverTitle}>{title}</h3>
      </CoverBlock>
      <p className={s.coverMeta}>{meta}</p>
    </article>
  )
}
