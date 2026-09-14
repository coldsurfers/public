import { style } from '@vanilla-extract/css'
import { type RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { componentsLayer } from './layers'
import { vars } from './theme.css'

/**
 * 지면을 가르는 1px 선. 시안에서 섹션 경계·장부 칸·테이블 행이 전부 이 하나를 쓴다.
 * 굵기는 고르게 하지 않는다 — 선은 한 종류다.
 */
export const hairline = recipe({
  variants: {
    side: {
      top: {
        '@layer': {
          [componentsLayer]: { borderTop: `${vars.border.hairline} solid ${vars.color.line}` },
        },
      },
      bottom: {
        '@layer': {
          [componentsLayer]: { borderBottom: `${vars.border.hairline} solid ${vars.color.line}` },
        },
      },
      left: {
        '@layer': {
          [componentsLayer]: { borderLeft: `${vars.border.hairline} solid ${vars.color.line}` },
        },
      },
    },
  },
})

export type HairlineVariants = RecipeVariants<typeof hairline>

/**
 * 아직 아무것도 걸리지 않은 릴리즈 자리.
 *
 * ⚠️ 시안의 점선은 6/6 패턴인데 CSS `border-style: dashed` 는 패턴을 지정할 수 없다.
 * 그래서 `repeating-linear-gradient` 로 네 변을 직접 그린다 — `border.dashArray` 가
 * 그대로 반영되는 유일한 길이다.
 */
export const dashedSlot = style({
  '@layer': {
    [componentsLayer]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: [
        `repeating-linear-gradient(to right, ${vars.color.line} 0 6px, transparent 6px 12px)`,
        `repeating-linear-gradient(to right, ${vars.color.line} 0 6px, transparent 6px 12px)`,
        `repeating-linear-gradient(to bottom, ${vars.color.line} 0 6px, transparent 6px 12px)`,
        `repeating-linear-gradient(to bottom, ${vars.color.line} 0 6px, transparent 6px 12px)`,
      ].join(', '),
      backgroundSize: '100% 1px, 100% 1px, 1px 100%, 1px 100%',
      backgroundPosition: 'top left, bottom left, top left, top right',
      backgroundRepeat: 'no-repeat',
    },
  },
})
