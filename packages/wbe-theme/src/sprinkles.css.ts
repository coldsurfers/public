import { gap, pad } from '@coldsurfers/wbe-tokens'
import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'
import { vars } from './theme.css'

/**
 * 레이아웃·색 원자 유틸. **활자는 여기 없다** — 그건 `text()` recipe 의 몫이고,
 * 축을 둘로 열면 시안에 없는 조합(Plex Mono 136px 같은)이 만들어진다.
 *
 * 값 이름은 토큰 키를 그대로 쓴다(`paddingX: 'padPage'`). 사전을 한 벌 더 만들면
 * 토큰이 바뀔 때 조용히 어긋난다 — 장황함보다 SSOT 하나가 싸다.
 *
 * 간격은 토큰의 두 축을 그대로 받는다. `gap*` 은 형제 사이, `pad*` 는 안쪽 여백이라
 * 서로의 자리에 못 들어간다 — 한 스케일로 열면 `gap: 'padHeroTop'` 이 타입상 유효해진다.
 * 치수도 타일 두 종만 받는다. `canvas`(1440)는 지면 판형이라 유틸의 축이 아니다.
 *
 * **레이어를 달지 않는다.** unlayered 가 모든 레이어를 이기므로, 호출부가 넘긴 유틸이
 * recipe 를 덮는다. 유틸이 유틸답게 동작하는 유일한 배선이다.
 */
function spacingAxis<T extends Record<string, number>>(axis: T): { [K in keyof T]: string } {
  return Object.fromEntries(
    Object.keys(axis).map((key) => [key, vars.spacing[key as keyof typeof vars.spacing]]),
  ) as { [K in keyof T]: string }
}

const gapSpace = spacingAxis(gap)
const padSpace = spacingAxis(pad)
const tileSize = { tile: vars.size.tile, tileSm: vars.size.tileSm }

const properties = defineProperties({
  properties: {
    display: ['none', 'block', 'flex', 'grid'],
    flexDirection: ['row', 'column'],
    flexWrap: ['nowrap', 'wrap'],
    alignItems: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
    justifyContent: ['flex-start', 'center', 'flex-end', 'space-between'],
    gap: gapSpace,
    rowGap: gapSpace,
    columnGap: gapSpace,
    paddingTop: padSpace,
    paddingBottom: padSpace,
    paddingLeft: padSpace,
    paddingRight: padSpace,
    width: tileSize,
    height: tileSize,
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
