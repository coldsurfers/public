import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'
import { vars } from './theme.css'

/**
 * 레이아웃·색 원자 유틸. **활자는 여기 없다** — 그건 `text()` recipe 의 몫이고,
 * 축을 둘로 열면 시안에 없는 조합(Plex Mono 136px 같은)이 만들어진다.
 *
 * 값 이름은 토큰 키를 그대로 쓴다(`paddingX: 'padPage'`). 사전을 한 벌 더 만들면
 * 토큰이 바뀔 때 조용히 어긋난다 — 장황함보다 SSOT 하나가 싸다.
 *
 * **레이어를 달지 않는다.** unlayered 가 모든 레이어를 이기므로, 호출부가 넘긴 유틸이
 * recipe 를 덮는다. 유틸이 유틸답게 동작하는 유일한 배선이다.
 */
const properties = defineProperties({
  properties: {
    display: ['none', 'block', 'flex', 'grid'],
    flexDirection: ['row', 'column'],
    flexWrap: ['nowrap', 'wrap'],
    alignItems: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
    justifyContent: ['flex-start', 'center', 'flex-end', 'space-between'],
    gap: vars.spacing,
    rowGap: vars.spacing,
    columnGap: vars.spacing,
    paddingTop: vars.spacing,
    paddingBottom: vars.spacing,
    paddingLeft: vars.spacing,
    paddingRight: vars.spacing,
    width: vars.size,
    height: vars.size,
    color: vars.color,
    background: vars.color,
  },
  shorthands: {
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom'],
    /** 타일은 정사각이다 — 두 변을 따로 주는 자리를 열지 않는다. */
    boxSize: ['width', 'height'],
  },
})

export const sprinkles = createSprinkles(properties)

export type Sprinkles = Parameters<typeof sprinkles>[0]
