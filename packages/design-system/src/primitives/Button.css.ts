import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 액션 버튼의 스타일 계약.
 *
 * `cx('inline-flex …', variantCls[variant], sizeCls[size])` 를 대체한다. 얻는 것은
 * **variant 조합의 타입 안전** — 없는 variant 를 넘기면 `tsc` 가 막는다. 문자열 맵에서는
 * 오타가 조용히 "클래스 없음"으로 흘렀다.
 *
 * ⚠️ **호출자 className 의 우선순위를 recipe 가 보장하지는 않는다.** 그건 레이어가 한다 —
 * `inComponentsLayer` 로 `ds-components` 에 들어가고, 유틸(과도기엔 Tailwind, Phase 6 이후
 * sprinkles)은 더 뒤 레이어라 항상 이긴다.
 *
 * 치수(36·52·16·24)는 토큰에 없는 값이라 px 로 적는다 — 기존 `h-9`·`h-[52px]`·`px-4`·`px-6` 등가.
 * 토큰 스케일 승격은 Phase 6 의 일이다(열린 결정 9).
 *
 * ## 높이는 `height` 로 박는다 — 컨트롤 공통 규율
 *
 * padding 만으로 높이를 만들면 높이가 **line box** 를 탄다. line box = 폰트 크기 × 상속
 * `line-height` 인데, 그 상속값은 컨트롤이 정하는 게 아니다 — 지금은 Tailwind preflight 의
 * `html { line-height: 1.5 }` 가 같은 preflight 의 `button { font: inherit }` 를 타고
 * 내려와서 1.5 지만, 조상이 그 값을 바꾸거나 preflight 가 걷히면 같은 버튼이 표면마다 다른
 * 높이로 선다. 시안 대조도 라벨 길이·폰트에 따라 흔들린다.
 *
 * 그래서 `height` 를 박고 padding 은 좌우만 준다. base 의 `inline-flex` + `center` 정렬이
 * 라벨을 세로 가운데로 잡아주므로 세로 padding 은 필요 없다. `Chip`·`Select` 도 같은 규율.
 */
export const button = recipe({
  base: inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: vars.fontWeight.medium,
    border: 'none',
    cursor: 'pointer',
    transitionProperty: 'color, background-color, border-color, opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }),

  variants: {
    variant: {
      primary: inComponentsLayer({
        background: vars.color.text,
        color: vars.color.bg,
        selectors: { '&:hover': { opacity: 0.9 } },
      }),
      ghost: inComponentsLayer({
        background: 'transparent',
        color: vars.color.body,
        selectors: { '&:hover': { color: vars.color.accent } },
      }),
      accent: inComponentsLayer({
        background: vars.color.accent,
        color: 'white',
        selectors: { '&:hover': { background: vars.color.accentHover } },
      }),
      // base 의 `border: none` 을 shorthand 로 덮는다 — longhand 로 켜면 base 의 shorthand 와
      // 우선순위가 소스 순서에 걸려 조용히 사라진다.
      outline: inComponentsLayer({
        background: 'white',
        color: vars.color.text,
        border: `1px solid ${vars.color.border}`,
        selectors: { '&:hover': { borderColor: vars.color.strong } },
      }),
    },

    size: {
      sm: inComponentsLayer({
        height: 36,
        paddingInline: 16,
        fontSize: vars.fontSize.sm,
        borderRadius: vars.radius.md,
      }),
      md: inComponentsLayer({
        height: 52,
        paddingInline: 24,
        fontSize: vars.fontSize.base,
        borderRadius: vars.radius.lg,
      }),
      /**
       * 랜딩 히어로 CTA — Figma `1128:119`·`1128:121` (148×46 · 86×46).
       *
       * **`height` 가 시안 일치의 전부다** (이유는 상단 §높이). 높이를 박으면 라벨 크기와
       * 무관하게 46px 이다.
       *
       * `15px` 은 스케일 밖 리터럴이다 — 토큰이 12.5~17px 을 의도적으로 접었다
       * (`tokens.ts` 타이포 스케일 주석, 2026-08-04 실측). 위 36·52 와 같은 취급.
       */
      cta: inComponentsLayer({
        height: 46,
        paddingInline: 22,
        fontSize: '15px',
        borderRadius: '10px',
      }),
    },
  },

  defaultVariants: { variant: 'primary', size: 'md' },
})

/** 라벨 뒤 아이콘 슬롯 — 줄어들지 않게만 붙든다. */
export const buttonIcon = style(inComponentsLayer({ flexShrink: 0 }))
