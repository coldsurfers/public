import {
  border,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  size,
  spacing,
  type TokenGroup,
  tokenVarName,
} from '@coldsurfers/wbe-tokens'
import { assignVars, createGlobalThemeContract, globalStyle } from '@vanilla-extract/css'
import { themeLayer } from './layers'
import './layers.css'

/** 스케일의 키만 남기고 값을 비운다 — contract 모양을 토큰에서 그대로 따온다. */
function nullify<T extends Record<string, unknown>>(scale: T): { [K in keyof T]: null } {
  return Object.fromEntries(Object.keys(scale).map((key) => [key, null])) as {
    [K in keyof T]: null
  }
}

function toPx<T extends Record<string, number>>(scale: T): { [K in keyof T]: string } {
  return Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, `${value}px`])) as {
    [K in keyof T]: string
  }
}

function toEm<T extends Record<string, number>>(scale: T): { [K in keyof T]: string } {
  return Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, `${value}em`])) as {
    [K in keyof T]: string
  }
}

function toText<T extends Record<string, number>>(scale: T): { [K in keyof T]: string } {
  return Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, String(value)])) as {
    [K in keyof T]: string
  }
}

/**
 * CSS 변수 **이름**은 `wbe-tokens` 의 `tokenVarName` 이 정한다 — VE 해시 이름을 쓰지 않는다.
 * 소비처가 `var(--wbe-bg)` 를 직접 쓰거나 값을 덮어쓸 수 있어야 하기 때문이다.
 */
export const vars = createGlobalThemeContract(
  {
    color: nullify(color),
    fontFamily: nullify(fontFamily),
    fontSize: nullify(fontSize),
    lineHeight: nullify(lineHeight),
    letterSpacing: nullify(letterSpacing),
    fontWeight: nullify(fontWeight),
    spacing: nullify(spacing),
    size: nullify(size),
    border: nullify(border),
  },
  (_value, path) => tokenVarName(path[0] as TokenGroup, path[1] as string),
)

/**
 * 값 주입 — **레이어 안에서 찍는다.** (`createGlobalTheme` 을 안 쓰는 이유가 이것이다)
 *
 * `createGlobalTheme` 은 `:root` 를 레이어 밖에 찍는다. 그러면 소비처가 같은 변수를
 * 반응형으로 다시 선언할 때(`@media { :root { … } }`) 특이성이 `:root` 대 `:root` 로
 * 같아져 **나중에 로드된 쪽**이 이긴다. 그리고 그 순서는 소비처 번들러가 정한다 —
 * 이 CSS 는 패키지를 import 한 *컴포넌트 청크*에 실려 나가므로 진입점의 import 순서로
 * 잡히지 않는다. 실제로 `white-blind-eye` 의 모바일 재선언 27개가 통째로 죽어 375px
 * 에서 display 가 46px 이 아니라 136px 로 그려졌다.
 *
 * 레이어 안에 넣으면 **레이어 밖이 언제나 레이어를 이기므로**, 소비처의 평범한
 * `:root` 한 줄이 로드 순서와 무관하게 항상 덮는다.
 */
globalStyle(':root', {
  '@layer': {
    [themeLayer]: {
      vars: assignVars(vars, {
        color,
        fontFamily,
        fontSize: toPx(fontSize),
        lineHeight: toText(lineHeight),
        letterSpacing: toEm(letterSpacing),
        fontWeight: toText(fontWeight),
        spacing: toPx(spacing),
        size: toPx(size),
        border: toPx(border),
      }),
    },
  },
})
