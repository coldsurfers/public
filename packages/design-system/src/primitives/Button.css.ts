import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import {
  type ButtonColor,
  type ButtonSize,
  type ButtonVariant,
  BUTTON_SPEC as spec,
} from '../contract'
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
 * 치수와 variant→색 배정은 `contract/button.ts` 의 `BUTTON_SPEC` 이 정본이다 — native
 * 구현이 같은 표를 읽으므로 여기 숫자·색을 손으로 고치면 두 레인이 갈린다. `:hover` 와
 * `transition` 만 리터럴로 남는다: RN 엔 짝이 없어 **갈라질 상대가 없고**, 짝이 없으면
 * 계약이 아니다.
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

/** `ButtonColor` → CSS 값. native `Button.tsx` 의 `colorFor` 와 짝이다. */
function colorFor(color: ButtonColor): string {
  return color === 'white' || color === 'transparent' ? color : vars.color[color]
}

/**
 * 치수 — 스케일 안이면 토큰 var, 밖이면 px 리터럴이다(`cta` 만 후자).
 * 판정을 `BUTTON_SPEC` 이 값의 종류로 이미 해놨으므로 여기선 옮기기만 한다.
 */
function sizeStyle(size: ButtonSize) {
  const s = spec.size[size]
  return {
    height: s.height,
    paddingInline: s.paddingInline,
    fontSize: typeof s.fontSize === 'number' ? `${s.fontSize}px` : vars.fontSize[s.fontSize],
    borderRadius: typeof s.radius === 'number' ? `${s.radius}px` : vars.radius[s.radius],
  }
}

/**
 * 바탕·글자·테두리. `:hover` 는 짝이 없어 호출부가 얹는다.
 *
 * 테두리를 **shorthand 로** 낸다 — base 의 `border: none` 을 longhand 로 덮으면 우선순위가
 * 소스 순서에 걸려 조용히 사라진다.
 */
function surfaceStyle(variant: ButtonVariant) {
  const v = spec.variant[variant]
  return {
    background: colorFor(v.background),
    color: colorFor(v.label),
    ...('border' in v ? { border: `${v.border.width}px solid ${colorFor(v.border.color)}` } : null),
  }
}

export const button = recipe({
  base: inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spec.gap,
    fontWeight: vars.fontWeight[spec.fontWeight],
    border: 'none',
    cursor: 'pointer',
    transitionProperty: 'color, background-color, border-color, opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }),

  variants: {
    variant: {
      primary: inComponentsLayer({
        ...surfaceStyle('primary'),
        selectors: { '&:hover': { opacity: 0.9 } },
      }),
      ghost: inComponentsLayer({
        ...surfaceStyle('ghost'),
        selectors: { '&:hover': { color: vars.color.accent } },
      }),
      accent: inComponentsLayer({
        ...surfaceStyle('accent'),
        selectors: { '&:hover': { background: vars.color.accentHover } },
      }),
      /**
       * 되돌릴 수 없는 액션. hover 는 `accentHover` 같은 짝 토큰이 없어 `primary` 와 같은
       * 방식(투명도)으로 낸다 — 상태 색 하나를 위해 토큰을 늘리지 않는다.
       */
      danger: inComponentsLayer({
        ...surfaceStyle('danger'),
        selectors: { '&:hover': { opacity: 0.9 } },
      }),
      outline: inComponentsLayer({
        ...surfaceStyle('outline'),
        selectors: { '&:hover': { borderColor: vars.color.strong } },
      }),
    },

    size: {
      sm: inComponentsLayer(sizeStyle('sm')),
      md: inComponentsLayer(sizeStyle('md')),
      /** 랜딩 히어로 CTA — Figma `1128:119`·`1128:121`. 시안 일치의 전부는 `height` 다. */
      cta: inComponentsLayer(sizeStyle('cta')),
    },
  },

  defaultVariants: { variant: 'primary', size: 'md' },
})

/** 라벨 뒤 아이콘 슬롯 — 줄어들지 않게만 붙든다. */
export const buttonIcon = style(inComponentsLayer({ flexShrink: 0 }))
