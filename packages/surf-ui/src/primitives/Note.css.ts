import { style, styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/**
 * 알림 노트 한 장 — **메타 한 줄 + 헤드라인 한 줄**, 그게 전부인 카드.
 *
 * ## 이 크기 대비가 규율의 형태다
 *
 * 메타 10/11px ↔ 헤드라인 14/15px, 차이 4px, 무게는 둘 다 500 하나. 위계를 *크기*가 아니라
 * **여백과 순서**로 만든다는 규율이 여기서 가장 압축돼 있다 — 그래서 이게 랜딩 한 자리의
 * 장식이 아니라 프리미티브다. 근거·실측: coldsurfers/paul-rockstar#452.
 *
 * ## 값은 `apps/im-coldsurf` 랜딩의 `NotePanel` **그대로**다
 *
 * 그 표면이 이 톤의 정본이고 나머지 표면이 그쪽으로 옮겨 가는 중이라, **정본이 픽셀 하나도
 * 움직이면 안 된다.** 처음엔 세 자리를 접었었다 — radius 짝(14→16)을 16 하나로, 헤드라인
 * 짝(14→15)을 14 하나로, 메타 기본색을 `muted` 로. 눈금 규율을 근거로 든 건데, 그 셋이 곧
 * 정본의 회귀였다. 되돌렸다.
 *
 * 그래서 이 파일엔 **토큰 눈금 밖 리터럴이 넷** 있다(radius 14 · padding 16/18/22 · 헤드라인
 * 15px). 승격하지 않는 이유는 `tokens.ts` 의 radius 주석과 `fontSize` 문서가 같은 자리에서
 * 이미 판단했다 — 반응형 짝을 평평하게 늘어놓으면 스케일이 아니라 목록이 된다. 짝은 이렇게
 * **슬롯 안에** 산다.
 *
 * ## 브레이크포인트가 `desktop` 인 이유
 *
 * 정본의 반응형 축이 1024 하나다. `im-coldsurf` 의 `theme.css.ts` 가 왜인지 적어 뒀다 —
 * *"태블릿 시안이 없으므로 중간 단을 만들지 않는다"*. 여기서 `tablet`(768)을 쓰면 정본이
 * 일부러 안 만든 중간 단이 생긴다.
 *
 * ## 레이어
 *
 * `ds-components` — 호출자가 얹는 sprinkles 유틸이 항상 이긴다.
 */

/** 정본 실측값(Figma Page 16 · 데스크탑 1440 / 모바일 390). 짝으로 움직이므로 표로 둔다. */
const SPEC = {
  padding: { mobile: '14px 16px', desktop: '18px 22px' },
  gap: { mobile: '6px', desktop: '7px' },
  radius: { mobile: '14px', desktop: vars.radius['2xl'] },
  /** 헤드라인 데스크탑 15px 은 `fontSize` 가 의도적으로 접은 12.5~17px 구간 안이라 리터럴이다. */
  headline: { mobile: vars.fontSize.sm, desktop: '15px' },
} as const

export const note = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: SPEC.gap.mobile,
    padding: SPEC.padding.mobile,
    borderRadius: SPEC.radius.mobile,
    background: vars.color.surface,
    boxShadow: vars.shadow.sm,
    '@media': {
      [media.desktop]: {
        gap: SPEC.gap.desktop,
        padding: SPEC.padding.desktop,
        borderRadius: SPEC.radius.desktop,
      },
    },
  }),
)

/**
 * 메타 한 줄 — 시각·수치·출처처럼 *헤드라인을 놓을 자리*를 말하는 줄.
 *
 * `geist` 인 이유는 내용이 대개 수치·라틴이라서다(그 축의 정본 폰트). 자간 `0.04em` 은
 * 양수인데, 작은 크기에서 라틴 글리프가 뭉치는 걸 푸는 값이라 `letterSpacing` 눈금(전부
 * 음수)과 축이 다르다 — `editorialType.eyebrow` 가 같은 자리에서 같은 이유로 리터럴을 쓴다.
 */
const metaBase = inComponentsLayer({
  fontFamily: vars.font.geist,
  fontWeight: vars.fontWeight.medium,
  fontSize: vars.fontSize['3xs'],
  letterSpacing: '0.04em',
  '@media': { [media.desktop]: { fontSize: vars.fontSize['2xs'] } },
})

/**
 * 메타 색 축. 기본이 `accent` 인 건 정본이 그렇기 때문이다.
 *
 * 「accent 글자는 *누를 것*에만」 규율(#452 Phase 2)의 **명시적 예외 자리**다 — 노트의 메타
 * 한 줄은 그 규율이 처음부터 인정한 유일한 채도 자리고, 타입 램프의 `metaText` 주석도 이
 * 자리를 근거로 적혀 있다. 읽는 글로 쓰는 노트는 `tone="muted"` 로 내린다.
 */
export const noteMetaTone = styleVariants({
  accent: [metaBase, inComponentsLayer({ color: vars.color.accent })],
  muted: [metaBase, inComponentsLayer({ color: vars.color.muted })],
})

/**
 * 헤드라인 — 이 카드가 말하려는 것 하나. 크기를 키우지 않고 무게로 든다.
 *
 * `line-height` 를 **안 정한다.** 정본이 상속에 맡기고 있고, 여기서 값을 박으면 노트가 놓인
 * 지면마다 다른 행간을 강제하게 된다.
 */
export const noteHeadline = style(
  inComponentsLayer({
    fontSize: SPEC.headline.mobile,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.text,
    '@media': { [media.desktop]: { fontSize: SPEC.headline.desktop } },
  }),
)
