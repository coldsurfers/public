import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 표면 한 덩이 — gutter(`container`) 위에 **내부 세로 리듬만** 얹는다.
 *
 * ⚠️ **바깥 여백(`padding-block`)은 여기서 정하지 않는다.** web-next 실측에서 표면마다 값이
 * 갈렸고(2~14), 지금 prop 축으로 열면 그건 추상화가 아니라 목록이 된다. 22표면을 옮겨 본 뒤
 * 정한다 — 그때까지는 호출자가 유틸로 준다(#19 열린 결정 1).
 */
export const section = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['4'],
  }),
)

/** eyebrow·제목 묶음(왼쪽) ↔ 액션(오른쪽). 좁은 화면에서도 한 줄을 유지하고 액션이 밀리지 않는다. */
export const header = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: vars.space['4'],
  }),
)

/** eyebrow 위 · 제목 아래. */
export const headerText = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1.5'],
  }),
)

export const title = style(
  inComponentsLayer({
    margin: 0,
    fontSize: vars.fontSize.xl,
    lineHeight: vars.lineHeight.tight,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.strong,
  }),
)

/** 액션은 줄어들지 않는다 — 제목이 길어지면 제목이 접힌다. */
export const action = style(inComponentsLayer({ flexShrink: 0 }))
