import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/**
 * 테두리 입력 셸 — 시안의 `아티스트나 장르 하나…` 검색 필드.
 *
 * `tone` 은 **깔린 표면**이다. 라이트 표면 위(기본)와 다크 밴드 위(`color.strong`)는 전경이
 * 통째로 뒤집힌다 — 라이트의 `surface`·`border` 를 다크 위에 그대로 두면 흰 상자가 뜬다.
 *
 * ⚠️ 변형을 recipe 로 두는 건 **덮어쓰기 싸움을 피하려고**다. `border`·`background` 는
 * shorthand 라 바깥 클래스로 덮으면 같은 레이어·같은 명시도가 되어 승패가 CSS 소스 순서에
 * 걸린다(`Button.css.ts` 의 outline variant 주석과 같은 함정). 한 파일 안의 variant 는
 * 그 순서가 결정적이다.
 */
export const fieldShell = recipe({
  base: inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
  }),
  variants: {
    tone: {
      light: inComponentsLayer({
        height: 52,
        borderRadius: vars.radius.lg,
        border: `1px solid ${vars.color.border}`,
        background: vars.color.surface,
        selectors: { '&:focus-within': { borderColor: vars.color.text } },
      }),
      /**
       * 다크 밴드 위 — `/daily` 구독 밴드 시안(`1434:572`·`1434:656`). 배경을 칠하지 않고
       * 테두리만 두는 건 밴드의 `strong` 바닥을 그대로 비쳐 보이게 하기 위해서다.
       * 높이 52→56(데스크탑)은 그 시안 치수다. 다크 소비처가 더 생기고 치수가 갈리면
       * 그때 `size` 축을 따로 낸다 — 지금은 자리가 하나뿐이라 여기 둔다.
       */
      dark: inComponentsLayer({
        height: 52,
        borderRadius: '10px',
        border: `1px solid ${vars.color.muted}`,
        background: 'transparent',
        selectors: { '&:focus-within': { borderColor: vars.paper.warm } },
        '@media': { [media.desktop]: { height: 56 } },
      }),
    },
  },
  defaultVariants: { tone: 'light' },
})

export const fieldInput = recipe({
  base: inComponentsLayer({
    minWidth: 0,
    flex: 1,
    background: 'transparent',
    outline: 'none',
    border: 'none',
  }),
  variants: {
    tone: {
      light: inComponentsLayer({
        fontSize: vars.fontSize.base,
        color: vars.color.body,
        '::placeholder': { color: vars.color.subtle },
      }),
      dark: inComponentsLayer({
        fontSize: '15px',
        color: vars.paper.warm,
        '::placeholder': { color: vars.color.subtle },
      }),
    },
  },
  defaultVariants: { tone: 'light' },
})

/** 우측 슬롯 — ↵ 힌트·버튼 등. `subtle` 은 두 tone 위에서 다 읽혀 변형이 없다. */
export const fieldTrailing = style(inComponentsLayer({ flexShrink: 0, color: vars.color.subtle }))
