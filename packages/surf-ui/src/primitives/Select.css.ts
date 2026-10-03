import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 트리거 — 열림 상태에서 accent 테두리로 활성 신호를 준다.
 *
 * ⚠️ 높이는 `height` 로 박는다 — 이유는 `Button.css.ts` 의 §높이(컨트롤 공통 규율).
 * 39 는 상속 `line-height: 1.5` 에서 계산되던 값 그대로(14×1.5 + 8·2 + 1·2)라 픽셀은
 * 안 움직인다. 라벨은 한 줄짜리 필터 이름이라 접힐 일이 없다.
 */
export const selectTrigger = recipe({
  base: inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    background: vars.color.surface,
    height: 39,
    paddingLeft: 14,
    paddingRight: 12,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.strong,
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color, color',
    transitionDuration: '150ms',
  }),

  variants: {
    open: {
      true: inComponentsLayer({ borderColor: vars.color.accent }),
      false: inComponentsLayer({ borderColor: vars.color.border }),
    },
  },

  defaultVariants: { open: false },
})

/** caret ▾/▴ — 열림에서만 accent. */
export const selectCaret = recipe({
  base: inComponentsLayer({ fontSize: 11 }),
  variants: {
    open: {
      true: inComponentsLayer({ color: vars.color.accent }),
      false: inComponentsLayer({ color: vars.color.muted }),
    },
  },
  defaultVariants: { open: false },
})

export const selectMenu = style(inComponentsLayer({ minWidth: 200 }))

export const selectOption = recipe({
  base: inComponentsLayer({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    borderRadius: vars.radius.lg,
    border: 'none',
    background: 'transparent',
    padding: '8px 14px',
    textAlign: 'left',
    fontSize: vars.fontSize.sm,
    color: vars.color.strong,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  }),

  variants: {
    selected: {
      true: inComponentsLayer({
        background: vars.color.surface2,
        fontWeight: vars.fontWeight.semibold,
      }),
      false: inComponentsLayer({
        fontWeight: vars.fontWeight.medium,
        selectors: { '&:hover': { background: vars.color.surfaceHover } },
      }),
    },
  },

  defaultVariants: { selected: false },
})
