import { assignVars, globalStyle, style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { tokensLayer } from '../css/layers'
import { colorSchemes } from '../tokens/tokens'

/**
 * 표면 루트 — 화면을 채우는 세로 스택.
 *
 * `min-height: 100vh` 가 하는 일은 하나다: 콘텐츠가 짧은 표면(404·해지 완료 등)에서 푸터가
 * 화면 중간에 떠 있지 않게 한다. `Page.Content` 의 `flex: 1` 과 **짝으로만** 성립한다 —
 * 한쪽만 있으면 아무 효과가 없다. 둘이 갈라지는 자리를 없애는 게 이 컴포넌트의 존재 이유다.
 */
export const page = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  }),
)

/** `<main>` — 헤더와 푸터 사이의 남은 높이를 전부 먹는다. 위 `page` 와 짝. */
export const content = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  }),
)

/**
 * ink 페이지면 `<body>` 도 ink 스코프를 받는다. `<body>` 는 React 트리 밖이라 `Page` 가 못 칠하는데,
 * 비워 두면 짧은 페이지 아래·오버스크롤 바운스·iOS 26 상단 바(캔버스 색)가 light 로 샌다.
 * 스코프만 걸면 reset 의 `background: bgBase` 가 저절로 ink 값을 읽는다.
 * 안쪽 `[data-surface="ink"]` 구간(히어로 한 칸)이 아니라 **`Page` 루트**일 때만이다.
 * `auto` 페이지는 OS 가 다크일 때만 같은 스코프를 받는다.
 */
globalStyle(`body:has(${page}[data-surface="ink"])`, {
  '@layer': {
    [tokensLayer]: { colorScheme: 'dark', vars: assignVars(vars.color, colorSchemes.ink) },
  },
})

globalStyle(`body:has(${page}[data-surface="auto"])`, {
  '@layer': {
    [tokensLayer]: {
      '@media': {
        '(prefers-color-scheme: dark)': {
          colorScheme: 'dark',
          vars: assignVars(vars.color, colorSchemes.ink),
        },
      },
    },
  },
})
