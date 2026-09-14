import { type RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { componentsLayer } from './layers'
import { vars } from './theme.css'

/**
 * 활자 한 덩어리 = 한 이름. `variant` 하나가 패밀리·크기·행간·트래킹을 같이 정한다.
 *
 * 시안에서 **패밀리와 크기는 항상 붙어 다닌다** — 136px 은 언제나 Archivo Black 이고
 * 11px 라벨은 언제나 Plex Mono 다. 둘을 따로 고르게 열면 시안에 없는 조합이 생긴다.
 * 그래서 축을 쪼개지 않고 `variant` 하나로 묶었다.
 *
 * 색만 따로 연다(`tone`) — 같은 단이 본문에도 캡션에도 쓰이기 때문이다.
 */
export const text = recipe({
  base: {
    '@layer': { [componentsLayer]: { margin: 0 } },
  },
  variants: {
    variant: {
      /** 마스트헤드 `WHITE BLIND EYE`. */
      display: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.display,
            fontSize: vars.fontSize.display,
            lineHeight: vars.lineHeight.display,
          },
        },
      },
      /** 장부 값 `03` · `OPEN`. */
      metric: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.display,
            fontSize: vars.fontSize.metric,
            lineHeight: vars.lineHeight.display,
          },
        },
      },
      /** 로스터 아티스트명. */
      artist: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.display,
            fontSize: vars.fontSize.artist,
            lineHeight: vars.lineHeight.display,
          },
        },
      },
      /** 트랙 테이블 행 제목. */
      row: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.display,
            fontSize: vars.fontSize.row,
            lineHeight: vars.lineHeight.display,
          },
        },
      },
      /** 한국어 산문. */
      body: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.body,
            fontSize: vars.fontSize.body,
            lineHeight: vars.lineHeight.body,
          },
        },
      },
      /** 섹션 헤드 · topbar. */
      label: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.mono,
            fontSize: vars.fontSize.label,
            fontWeight: vars.fontWeight.mono,
            letterSpacing: vars.letterSpacing.mono,
          },
        },
      },
      /** 장부 키 · 릴리즈 캡션 제목. */
      labelSm: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.mono,
            fontSize: vars.fontSize.labelSm,
            fontWeight: vars.fontWeight.mono,
            letterSpacing: vars.letterSpacing.mono,
          },
        },
      },
      /** 캡션 메타. */
      meta: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.mono,
            fontSize: vars.fontSize.meta,
            fontWeight: vars.fontWeight.mono,
            letterSpacing: vars.letterSpacing.mono,
          },
        },
      },
      /** 아카이브 타일 캡션 메타. */
      metaSm: {
        '@layer': {
          [componentsLayer]: {
            fontFamily: vars.fontFamily.mono,
            fontSize: vars.fontSize.metaSm,
            fontWeight: vars.fontWeight.mono,
            letterSpacing: vars.letterSpacing.mono,
          },
        },
      },
    },
    tone: {
      fg: { '@layer': { [componentsLayer]: { color: vars.color.fg } } },
      muted: { '@layer': { [componentsLayer]: { color: vars.color.muted } } },
      /**
       * 구분선 색으로 찍은 글자. bg 대비 1.4:1 이라 **읽는 글자에 쓰지 않는다** —
       * 빈 슬롯의 `—` 처럼 읽히지 않아도 되는 표식 전용이다.
       */
      line: { '@layer': { [componentsLayer]: { color: vars.color.line } } },
    },
  },
  defaultVariants: {
    variant: 'body',
    tone: 'fg',
  },
})

export type TextVariants = RecipeVariants<typeof text>
