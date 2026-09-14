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
import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css'
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

createGlobalTheme(':root', vars, {
  color,
  fontFamily,
  fontSize: toPx(fontSize),
  lineHeight: toText(lineHeight),
  letterSpacing: toEm(letterSpacing),
  fontWeight: toText(fontWeight),
  spacing: toPx(spacing),
  size: toPx(size),
  border: toPx(border),
})
