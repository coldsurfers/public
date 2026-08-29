import { inComponentsLayer, vars } from '@coldsurfers/design-system'
import { style } from '@vanilla-extract/css'
// 부수효과 — 레이어 순서 선언이 이 스타일시트의 맨 앞에 실려야 한다. 근거는 `layers.css.ts`.
import '../layers.css'
import { alpha } from '@coldsurfers/design-system/style-utils'

/**
 * 라이트박스는 **스킴과 무관하게 어둡다** — 이미지를 보여주는 암실이라 토큰 표면색을 따르지 않는다.
 * 그래서 여기 색은 검정·흰색 리터럴이 맞고, 토큰으로 바꾸면 오히려 의도가 깨진다.
 */
export const backdrop = style(
  inComponentsLayer({
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: alpha('black', 90),
    backdropFilter: 'blur(4px)',
    cursor: 'zoom-out',
    padding: 24,
  }),
)

export const image = style(
  inComponentsLayer({ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }),
)

export const closeButton = style(
  inComponentsLayer({
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.radius.full,
    border: 'none',
    background: alpha('white', 10),
    color: 'white',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    selectors: {
      '&:hover': { background: alpha('white', 20) },
    },
  }),
)
