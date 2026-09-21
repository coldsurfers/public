import type { HTMLAttributes, ReactNode } from 'react'
import type { ConcertCardBareProps, ConcertCardCoverRatio, ConcertCardVariant } from '../contract'
import { CoverBlock, cx } from '../primitives'
import * as s from './ConcertCard.css'

/**
 * 공통분(`tone`·`initial`·`posterUrl`·`title`·`meta`·`footer`·`coverAction`·
 * `reserveTitleLines`)은 **계약에서 온다** — native 구현이 같은 인터페이스를 쓴다.
 * 여기 적는 건 **웹에만 있는 것**뿐이다.
 */
/**
 * 축 이름을 소비처가 부를 수 있게 낸다 — `ConcertCardProps['variant']` 로도 짚히지만
 * `Record<ConcertCardVariant, …>` 자리에선 이름이 필요하다. native 짝과 같은 규율.
 */
export type { ConcertCardCoverRatio, ConcertCardVariant }

/**
 * `cover` 섀시의 크기 축.
 *
 * **계약(`contract/concert-card.ts`)에 올리지 않았다.** 거기 있는 건 *두 구현이 같은 숫자를
 * 써야 하는 것* 뿐인데, native 는 `bare` 하나만 구현해 `cover` 섀시 자체가 없다 — 갈라질 짝이
 * 없으면 계약이 아니다(`ConcertCardVariant` 가 native 쪽 prop 이 아닌 것과 같은 이유).
 * native 가 이 섀시를 옮기는 날 그때 올린다.
 */
export type ConcertCardSize = 'full' | 'compact' | 'large'

/**
 * 루트 `<article>` 로 그대로 흘려보내는 DOM props — `id` · `data-*` · `aria-*` · `style` ·
 * `onMouseEnter` 등.
 *
 * **`title` 만 뺀다.** 카드가 그 이름을 이미 자기 API(제목 문자열)로 쓴다 — 둘을 같이 두면
 * `ConcertCardBareProps.title`(필수 `string`)과 DOM 의 `title`(선택 툴팁)이 한 이름에서
 * 부딪힌다(TS2320). 뺀 쪽은 DOM 툴팁이고, 그건 이 카드가 애초에 안 내던 것이다.
 *
 * `onClick` 이 열리는 건 `cards/index.ts` 의 "라우터 비의존" 과 어긋나지 않는다 — 카드가
 * 라우터를 **import 하지 않는다**는 뜻이지, 소비처가 준 DOM 핸들러를 버린다는 뜻이 아니었다.
 */
type CardDomProps = Omit<HTMLAttributes<HTMLElement>, 'title'>

export interface ConcertCardProps extends ConcertCardBareProps, CardDomProps {
  /**
   * 커버를 채우는 것. 주면 `posterUrl`·`initial` 대신 **이게 선다**(바닥 `tone` 은 그대로).
   *
   * 로드 실패 폴백처럼 **상태가 필요한 커버**를 위한 자리다. 이 엔트리는 훅도 `'use client'`
   * 도 없는 서버 안전 모듈이라 그 상태를 여기서 들 수 없다 — 들기 시작하면 `cards` 가 통째로
   * 클라이언트 전용이 되고, `primitives` 배럴이 `Toast` 로 겪은 RSC 사고를 그대로 반복한다.
   * 그래서 자리만 카드가 정하고 내용물은 소비처가 준다(`coverAction` 과 같은 규율).
   *
   * ⚠️ 공유 계약(`ConcertCardBareProps`)이 아니라 **웹 props 에만** 있다. native 는 이 자리를
   * 안 그리므로 공유로 올리면 「있는데 안 먹는 prop」이 하나 더 생긴다(`initial`·`footer` 가
   * 이미 앓은 병).
   */
  cover?: ReactNode
  /** 취향 매치 라벨 — `96% 취향`. 없으면 미노출. **`framed` 전용** (시안의 `bare` 엔 자리가 없다). */
  matchLabel?: string
  /** 커버 좌상단 라벨 — 시안의 장르 자리(`INDIE ROCK`). 없으면 미노출. **`cover` 전용**. */
  eyebrow?: string
  /**
   * 커버 카드의 크기. 기본 `full`. **`cover` 전용**.
   *
   * `full` — 세로 커버 한 장(430/500)에 eyebrow·담기·제목을 얹고, **메타는 커버 밖** 1줄.
   * `compact` — 작은 칸(290/300)이라 셋을 다 커버 안에 넣는다: 날짜(`meta`) → 제목 →
   * 공연장(`footer`). 스크림이 카드 전체 높이에 걸려 글이 포스터 위에서 읽힌다.
   * `large` — `compact` 와 같은 그림, 더 큰 칸(420/460 · 여백 24). 여러 열 그리드용.
   *
   * ⚠️ `full` 에서만 `footer` 가 안 그려진다 — 커버 아래에 메타 한 줄만 두는 섀시라서다.
   * 그 비대칭이 **이 문에만 남아 있다.** 정적 프로퍼티 문에는 이 축이 없다 — 크기가 문 이름
   * (`ConcertCard.Cover` · `.CoverCompact` · `.CoverLarge`)에 박혀 있고, `full` 쪽은 `footer` 를
   * 타입에서 아예 안 연다. 여기 남긴 건 `variant` 문이 쓰던 축이라서다(빼면 major).
   */
  size?: ConcertCardSize
  /**
   * `framed`(기본) — 테두리·배경 있는 액자 카드(`/live-events`·`/nearby`·`/gig-guide`).
   * `bare` — 시안 dice.fm 리스킨(Figma `931:32`·`931:259`): 섀시 없이 4:3 포스터 블록 + 그 아래 3줄
   * 텍스트. `/`(트렌딩 레일)·`/@<handle>`(담은 공연 그리드)이 쓴다.
   * `cover` — 시안 날짜 피드 리스킨(Figma `1093:171`·`1093:576`): 세로 커버 한 장에 eyebrow·담기·
   * 제목을 **얹고** 커버 아래엔 메타 1줄. `/live-events/new` 와 그 날짜 상세가 쓴다.
   * 작은 칸(레일)은 같은 섀시의 `size="compact"`, 여러 열 그리드는 `size="large"` —
   * 축은 `ConcertCardSize`.
   *
   * ⚠️ native 는 `bare` 만 구현한다 — 그래서 그쪽엔 이 prop 이 아예 없다.
   */
  variant?: ConcertCardVariant
}

/**
 * 공연 카드 — 시안 라이브 표면(Figma 585-126). 커버(포스터 or tone·이니셜) + 본문(title·meta·footer).
 * router 비의존 — 클릭은 소비처가 `Link` 로 감싼다. 높이는 내용 기준(고정 없음).
 *
 * 커버 바닥은 언제나 `tone` 색면(`CoverBlock`)이고, 그 위에 서는 것이 셋 중 하나다:
 * `cover` 슬롯을 주면 그것, 아니면 `posterUrl` 의 포스터, 그것도 없으면 대형 이니셜.
 * 실 이벤트에는 포스터를, 데모엔 이니셜을, **로드 실패까지 다뤄야 하면 `cover` 를** 쓴다.
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
 * ## 문은 둘, 하나는 관대하고 하나는 정확하다
 *
 * 그 섀시들을 정적 프로퍼티로도 낸다 — `ConcertCard.Framed` · `ConcertCard.Bare` ·
 * `ConcertCard.Cover` · `ConcertCard.CoverCompact` · `ConcertCard.CoverLarge`.
 * **문이 다섯인데 섀시는 셋**인 건 커버만 크기로 갈라 냈기 때문이다(아래).
 *
 * 평평한 `ConcertCardProps` 는 세 섀시의 축을 합집합으로 들고 있어서, 어느 문으로 들어오든
 * 타입이 **안 먹는 prop 을 통과시킨다**(`cover` 에 `matchLabel`, `framed` 에 `size`). 그중
 * 하나는 거짓말이 더 짙다 — `initial` 은 `cover` 섀시가 아무 데도 안 그리는데 계약상 **필수**라,
 * `variant="cover"` 를 쓰는 사람이 반드시 안 쓰이는 자모 한 글자를 지어내야 했다.
 * 섀시별 문으로 들어오면 그 자리에서 `Pick` 이 소비처까지 닿는다.
 *
 * **`variant` 는 그대로 산다 — 지우지 않는다.** 이 축은 `contract/concert-card.ts` 의
 * `ConcertCardVariant` 이고 native 레인이 같은 계약을 읽는다. 발행 중인 패키지라 문 이름을
 * 바꾸면 그 순간 major 다 — 안쪽 구조는 계약이 아니지만 문은 계약이다. 그래서 문을 **바꾸지
 * 않고 옆에 하나 더 단다**(순수 additive). 두 문 다 같은 컴포넌트를 가리켜 렌더 결과가 같다.
 *
 * 그래서 두 체계가 **공존한다.** `variant` 문은 관대하다 — 합집합 props 를 다 받고 안 먹는 건
 * 조용히 무시한다. 정적 프로퍼티 문은 정확하다 — 그 섀시가 그리는 것만 받고 나머지는 컴파일
 * 에러다. 기존 코드는 그대로 두고, **새 코드는 정확한 쪽으로 온다.**
 *
 * ```tsx
 * <ConcertCard variant="cover" size="compact" … />  // 그대로 산다 (관대한 문)
 * <ConcertCard.CoverCompact … />                    // 새 코드는 이쪽 (정확한 문)
 * ```
 *
 * ### 커버만 문이 셋인 이유
 *
 * `size` 는 크기 플래그처럼 생겼지만 **슬롯이 갈리는 축**이다 — `full` 밖에서만 `footer` 가
 * 그려지고 `meta` 가 커버 밖에서 안으로 옮겨 간다. 한 문에 플래그로 두면 `full` 쪽에서
 * `footer` 가 `initial` 과 똑같은 병(있는데 안 먹는 prop)에 걸린다. 크기를 **문 이름에 박으면**
 * 플래그가 바깥에서 사라져 그 병이 성립하지 않는다.
 *
 * `CoverCompact` 와 `CoverLarge` 사이는 슬롯이 같아 진짜 크기 축이다. 그런데도 문으로 나눈 건
 * 커버 문만 플래그를 되받으면 규율이 반쪽이 되기 때문이다 — 소비처가 「커버는 문으로 고른다」
 * 하나만 외우면 되게 둔다.
 */
export function ConcertCard({ variant = 'framed', ...props }: ConcertCardProps) {
  if (variant === 'cover') return <CoverCard {...props} />
  if (variant === 'bare') return <BareCard {...props} />
  return <FramedCard {...props} />
}

/**
 * 커버 한 장 — 포스터가 있으면 포스터, 없으면 폴백. 세 섀시가 글자 그대로 같은 한 장을 쓴다 —
 * 채우기(`objectFit: cover`)와 지연 로딩이 섀시별로 달라질 축이 아니다.
 *
 * **「포스터가 있는가」를 읽는 자리는 여기 하나다.** 예전엔 셋이 같은 질문에 다르게 답했다 —
 * `framed` 는 이 함수 밖에서 한 번 더 읽었고(`posterUrl ? null : initial`), `bare` 는 바깥
 * 삼항이 먼저 갈라서 여기 빈 갈래가 죽은 코드였다. 한쪽만 고치면 조용히 갈라지는 모양이다.
 *
 * 로드 **실패**는 여기서 안 잡는다 — 상태가 필요하고 이 엔트리는 무상태다. 그 처리가 필요한
 * 소비처는 `cover` 슬롯에 자기 컴포넌트를 꽂는다(`ConcertCardProps.cover`).
 *
 * `alt=""` 는 장식이라는 선언이다. 공연 정보는 옆 텍스트가 이미 말하므로 포스터를 한 번 더
 * 읽히면 같은 말을 두 번 한다.
 */
function CoverFill({ src, fallback }: { src?: string | null; fallback?: ReactNode }) {
  if (!src) return <>{fallback}</>
  return <img src={src} alt="" loading="lazy" className={s.coverImage} />
}

/**
 * `ConcertCard.Framed` 가 받는 것의 전부.
 *
 * ⚠️ **이름이 `ConcertCardFramedProps` 가 아닌 이유**: 짝인 민짜 쪽이 `ConcertCardBareProps`
 * 가 되는데 그 이름은 `contract/concert-card.ts` 가 이미 **다른 뜻**(두 구현이 공유하는 props)
 * 으로 쓰고 있다. 셋만 어순을 뒤집으면 갈라지므로 트리오를 통째로 형용사 먼저로 둔다 —
 * 안쪽 컴포넌트 이름(`FramedCard`·`BareCard`·`CoverCard`)과도 어순이 같아진다.
 */
export type FramedConcertCardProps = Pick<
  ConcertCardProps,
  | 'tone'
  | 'initial'
  | 'posterUrl'
  | 'cover'
  | 'matchLabel'
  | 'title'
  | 'meta'
  | 'footer'
  | 'coverAction'
  | 'className'
> &
  HTMLAttributes<HTMLElement>

/**
 * 액자 섀시 — 테두리·배경이 있는 기본 카드. 문은 `ConcertCard.Framed`
 * (= `<ConcertCard variant="framed" />`, 기본값).
 *
 * **받는 것**: `matchLabel`(취향 라벨) + 공통분(`tone`·`initial`·`posterUrl`·`title`·`meta`·
 * `footer`·`coverAction`).
 * **안 받는 것**: `eyebrow`·`size`(cover 전용) · `coverRatio`·`reserveTitleLines`(bare 전용).
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
  cover,
  matchLabel,
  title,
  meta,
  footer,
  coverAction,
  className,
  ...rest
}: FramedConcertCardProps) {
  return (
    <article className={cx(s.framedRoot, className)} {...rest}>
      <CoverBlock tone={tone} className={s.framedCover}>
        {cover ?? (
          <CoverFill
            src={posterUrl}
            fallback={<span className={s.framedInitial}>{initial}</span>}
          />
        )}
        {matchLabel ? (
          <span className={s.framedMatch}>
            <span className={s.framedMatchDot} />
            {matchLabel}
          </span>
        ) : null}
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

/**
 * `ConcertCard.Bare` 가 받는 것의 전부. 어순 근거는 `FramedConcertCardProps` 의 ⚠️ —
 * `ConcertCardBareProps`(계약)는 *두 구현이 공유하는 props* 라는 다른 뜻으로 이미 쓰인다.
 */
export type BareConcertCardProps = Pick<
  ConcertCardProps,
  | 'tone'
  | 'initial'
  | 'posterUrl'
  | 'cover'
  | 'title'
  | 'meta'
  | 'footer'
  | 'coverAction'
  | 'coverRatio'
  | 'reserveTitleLines'
  | 'className'
> &
  HTMLAttributes<HTMLElement>

/**
 * 민짜 섀시 — 섀시 없이 포스터 블록 + 그 아래 3줄 텍스트(제목 / 날짜 / 공연장).
 * 문은 `ConcertCard.Bare`(= `<ConcertCard variant="bare" />`).
 *
 * **받는 것**: `coverRatio`·`reserveTitleLines` + 공통분.
 * **안 받는 것**: `matchLabel`(framed 전용) · `eyebrow`·`size`(cover 전용).
 *
 * 치수는 `CONCERT_CARD_BARE_SPEC` 이 정본이고 native 구현이 같은 표를 읽는다.
 */
function BareCard({
  tone,
  initial,
  posterUrl,
  cover,
  title,
  meta,
  footer,
  coverAction,
  coverRatio = 'landscape',
  reserveTitleLines = false,
  className,
  ...rest
}: BareConcertCardProps) {
  return (
    <article className={cx(s.bareRoot, className)} {...rest}>
      <CoverBlock tone={tone} className={cx(s.bareCover, s.bareCoverRatio[coverRatio])}>
        {cover ?? (
          <CoverFill src={posterUrl} fallback={<span className={s.bareInitial}>{initial}</span>} />
        )}
        {coverAction ? <div className={s.bareCoverAction}>{coverAction}</div> : null}
      </CoverBlock>
      {/* 시안 meta — 제목(strong) / 날짜(mono·muted — 스탬프는 수치라 mono 를 지킨다) /
          공연장(footer, muted) 3줄. */}
      <div className={s.bareMeta}>
        <h3 className={s.bareTitle({ reserve: reserveTitleLines })}>{title}</h3>
        <p className={s.bareLine}>{meta}</p>
        {footer}
      </div>
    </article>
  )
}

/**
 * `ConcertCard.Cover` 가 받는 것의 전부. 어순 근거는 `FramedConcertCardProps` 의 ⚠️.
 *
 * ⚠️ **`initial` 이 없다.** 평평한 `ConcertCardProps` 에서는 계약상 필수라 `variant="cover"`
 * 소비처가 안 그려질 자모를 지어내야 했는데, 이 문으로 들어오면 타입이 그 자리를 아예 안 연다.
 *
 * ⚠️ **`footer` 도 없다.** `full` 커버는 커버 밖에 메타 한 줄만 두는 섀시라 그 슬롯을
 * 아무 데도 안 그린다 — `initial` 과 같은 병이다. 공연장 줄이 필요하면 문이 다르다
 * (`ConcertCard.CoverCompact`).
 *
 * ⚠️ **`size` 도 없다.** 크기를 문이 이미 골랐다 — 아래 「커버만 문이 셋인 이유」.
 */
export type CoverConcertCardProps = Pick<
  ConcertCardProps,
  'tone' | 'posterUrl' | 'cover' | 'eyebrow' | 'title' | 'meta' | 'coverAction' | 'className'
> &
  HTMLAttributes<HTMLElement>

/**
 * `ConcertCard.CoverCompact` 가 받는 것의 전부 — **`Cover` 와 같고 `footer` 하나가 더 있다.**
 *
 * 키 목록을 두 번 적지 않고 위 타입에 얹는다. 두 벌로 적으면 커버 축이 하나 늘 때 한쪽만
 * 따라오는 날이 온다 — 이 파일이 `CONCERT_CARD_BARE_SPEC` 에 대해 하는 말과 같은 이유다.
 *
 * 이름이 문(`CoverCompact`)과 1:1 인 것도 의도다. `CompactCover…` 로 뒤집으면 자동완성에서
 * `Cover…` 두 줄이 안 붙어 선다.
 */
export type CoverCompactConcertCardProps = CoverConcertCardProps & Pick<ConcertCardProps, 'footer'>

/**
 * `ConcertCard.CoverLarge` 가 받는 것의 전부 — **`CoverCompact` 와 글자 그대로 같다.**
 *
 * 같은데도 이름을 따로 두는 건 **문↔타입 짝을 깨지 않기 위해서**다. 문이 넷인데 타입이 셋이면
 * 소비처가 `CoverLarge` 의 props 를 짚을 때 이름이 다른 문을 빌려야 하고, 그때부터 "이 둘이
 * 왜 같지" 를 매번 되짚게 된다. 같다는 사실은 여기 한 줄로 적혀 있는 편이 싸다.
 *
 * ⚠️ 둘이 갈리는 날엔 이 별칭을 풀고 각자 `Pick` 을 쓴다 — 별칭을 유지하려고 한쪽을 못 늘리는
 * 일이 생기면 안 된다.
 */
export type CoverLargeConcertCardProps = CoverCompactConcertCardProps

/**
 * 안쪽 구현이 받는 것 — 바깥 세 문의 합집합 + `size`. **export 하지 않는다.**
 * 이게 밖으로 나가면 방금 닫은 문(`size` 플래그)이 다시 열린다.
 */
type CoverCardProps = CoverCompactConcertCardProps & Pick<ConcertCardProps, 'size'>

/**
 * 커버 섀시의 **안쪽 구현** — 세로 커버 한 장에 글을 얹는다. 밖으로 나가는 건 이 함수가
 * 아니라 크기를 고정한 세 문(`ConcertCard.Cover` · `.CoverCompact` · `.CoverLarge`)이다.
 * `variant="cover"` 문만 `size` 를 그대로 받아 여기로 흘린다.
 *
 * 크기 축(`size`)이 **글이 어디까지 커버 안인가**를 가른다:
 *
 * - `full`(기본) — eyebrow·담기·제목만 얹고 메타는 커버 **밖** 1줄. 날짜 피드가 쓴다.
 * - `compact` — 날짜(`meta`) → 제목 → 공연장(`footer`) 셋을 다 커버 **안** 하단에. 작은 칸이라
 *   커버 밖에 한 줄을 더 두면 카드가 두 덩어리로 갈라져 보인다.
 * - `large` — `compact` 와 **같은 그림, 더 큰 칸**(420/460 · 여백 24). 여러 열 그리드처럼 칸이
 *   넓은 자리에서 세로 포스터가 덜 잘린다.
 *
 * **마크업을 셋으로 나누지 않은 이유**: 커버 셸(`CoverBlock`·포스터·스크림)과 위 줄이 **글자
 * 그대로 같다.** 나누면 그 넷이 두 벌이 되고, 담기 버튼 자리를 한쪽에서만 고치는 날이 온다.
 * 갈리는 건 아래 블록 하나뿐이라 그 하나만 분기한다. 바깥 문이 셋인 것과 어긋나지 않는다 —
 * **타입만 둘이고 그림은 하나다.**
 *
 * 위 줄의 좌우 배치는 `coverTopAction` 의 `marginInlineStart: auto` 가 만든다. eyebrow 가
 * 없어도 담기 버튼은 제자리(우)를 지킨다 — 자리를 채우려고 빈 노드를 넣지 않는다.
 * `compact` 가 eyebrow 없이 담기만 두는 것도 그래서 공짜다.
 *
 * ⚠️ 이 섀시엔 `initial` 자리가 없다. 포스터가 없으면 tone 색면만 남는다 —
 * 세로 커버에 이니셜 한 자를 띄우면 mock 티가 나고, 이 지면은 실데이터 면이다.
 * 이 문으로 들어오면 그걸 주석이 아니라 **타입이** 말한다(`CoverConcertCardProps` 에 그
 * 이름이 없다). 평평한 `ConcertCardProps` 는 계약상 필수라 못 그러고, 그래서 `variant="cover"`
 * 소비처는 안 그려질 자모를 지어내야 했다.
 */
function CoverCard({
  tone,
  posterUrl,
  cover,
  eyebrow,
  title,
  meta,
  footer,
  coverAction,
  size = 'full',
  className,
  ...rest
}: CoverCardProps) {
  // 글이 커버 안에 드는가 — 크기가 아니라 **레이아웃**을 가르는 선이다. `compact` 와 `large` 는
  // 같은 쪽에 서고 치수만 다르다.
  const textInside = size !== 'full'

  return (
    <article className={cx(s.coverRoot, className)} {...rest}>
      <CoverBlock tone={tone} className={s.coverCover({ size })}>
        {cover ?? <CoverFill src={posterUrl} />}
        <div className={s.coverScrim({ size })} />
        <div className={s.coverTopRow}>
          {eyebrow ? <span className={s.coverEyebrow}>{eyebrow}</span> : null}
          {coverAction ? <div className={s.coverTopAction}>{coverAction}</div> : null}
        </div>
        {textInside ? (
          <div className={s.coverStack}>
            <p className={s.coverStamp}>{meta}</p>
            <h3 className={s.coverTitle({ size })}>{title}</h3>
            {footer ? <div className={s.coverVenue}>{footer}</div> : null}
          </div>
        ) : (
          <h3 className={s.coverTitle({ size })}>{title}</h3>
        )}
      </CoverBlock>
      {textInside ? null : <p className={s.coverMeta}>{meta}</p>}
    </article>
  )
}

/**
 * 커버 섀시 · 큰 칸 — 세로 커버 한 장(430/500)에 eyebrow·담기·제목을 얹고 메타는 커버 **밖**
 * 1줄. 문은 `ConcertCard.Cover`(= `<ConcertCard variant="cover" />`, `size` 기본값).
 *
 * **받는 것**: `eyebrow` + 공통분(`tone`·`posterUrl`·`title`·`meta`·`coverAction`).
 * **안 받는 것**: `initial`(이 섀시는 포스터 없으면 tone 색면만) · `footer`(이 섀시가 안
 * 그린다) · `size`(문이 이미 골랐다) · `matchLabel`(framed 전용) ·
 * `coverRatio`·`reserveTitleLines`(bare 전용).
 *
 * 공연장 줄을 얹고 싶으면 문이 다르다 — `ConcertCard.CoverCompact`.
 */
function CoverFullCard(props: CoverConcertCardProps) {
  return <CoverCard {...props} size="full" />
}

/**
 * 커버 섀시 · 작은 칸 — 작은 칸(290/300)이라 날짜(`meta`) → 제목 → 공연장(`footer`) 셋을 다
 * 커버 **안** 하단에 넣는다. 문은 `ConcertCard.CoverCompact`
 * (= `<ConcertCard variant="cover" size="compact" />`).
 *
 * **받는 것**: `ConcertCard.Cover` 와 같고 **`footer` 하나가 더** 있다.
 * **안 받는 것**: `initial` · `size` · `matchLabel` · `coverRatio`·`reserveTitleLines`.
 */
function CoverCompactCard(props: CoverCompactConcertCardProps) {
  return <CoverCard {...props} size="compact" />
}

/**
 * 커버 섀시 · 큰 칸(글은 커버 안) — `CoverCompact` 와 **같은 그림, 더 큰 칸**(420/460 · 여백 24).
 * 문은 `ConcertCard.CoverLarge`(= `<ConcertCard variant="cover" size="large" />`).
 *
 * 여는 자리 = **여러 열 그리드**. 칸이 420px 폭쯤 되면 `CoverCompact` 높이(300)로는 칸이 가로로
 * 누워 세로 포스터의 상하단이 크게 잘린다. 레일처럼 칸이 좁은 자리는 `CoverCompact` 가 맞다.
 *
 * **받는 것**: `ConcertCard.CoverCompact` 와 글자 그대로 같다(`footer` 포함).
 * **안 받는 것**: `initial` · `size` · `matchLabel` · `coverRatio`·`reserveTitleLines`.
 */
function CoverLargeCard(props: CoverLargeConcertCardProps) {
  return <CoverCard {...props} size="large" />
}

/**
 * 섀시별 문 — `variant` 문과 **같은 그림**을 가리킨다(순수 additive).
 *
 * 문이 다섯인데 섀시는 셋이다. 커버만 셋으로 쪼갠 건 `size` 가 크기 플래그가 아니라 **슬롯이
 * 갈리는 축**이기 때문이다 — `full` 은 `footer` 를 아무 데도 안 그린다. 한 문에 플래그로 두면
 * `initial` 에서 고친 병(있는데 안 먹는 prop)을 `footer` 자리에 새로 만든다.
 * 문으로 쪼개면 플래그가 **바깥에서 사라져** 크기가 문 이름에 박힌다.
 *
 * `CoverCompact` 와 `CoverLarge` 는 슬롯이 같고 치수만 다르다 — 그 둘 사이는 진짜 크기 축이라
 * 플래그로 둬도 거짓말을 안 하지만, 그러면 커버 문만 플래그를 되받아 규율이 반쪽이 된다.
 *
 * **평평한 `ConcertCardProps.size` 는 남는다.** `variant` 문이 쓰는 축이라 빼면 major 이고,
 * 애초에 그 문은 관대한 쪽이다 — 두 체계가 공존한다. 정확한 쪽이 필요하면 정적 프로퍼티로 온다.
 *
 * 각 문이 받는 것/안 받는 것은 위 컴포넌트들의 JSDoc 이 정본이다. 여기 적으면 `d.ts` 로
 * 안 따라간다 — 선언 병합이 `var Framed: typeof FramedCard` 한 줄로 떨어져서, 소비처 hover 가
 * 읽는 건 **가리켜진 컴포넌트의 JSDoc** 이다. 한 줄 적어 두는 대신 그쪽에 적는다.
 *
 * `Chip.Label` 과 같은 관용구다(`primitives/Chip.tsx`) — `export function` 에 직접 대입.
 */
ConcertCard.Framed = FramedCard
ConcertCard.Bare = BareCard
ConcertCard.Cover = CoverFullCard
ConcertCard.CoverCompact = CoverCompactCard
ConcertCard.CoverLarge = CoverLargeCard
