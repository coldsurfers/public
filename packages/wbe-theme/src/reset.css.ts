import { globalStyle } from '@vanilla-extract/css'
import { resetLayer } from './layers'
import { vars } from './theme.css'

/**
 * 최소 리셋. 지면이 다크 고정이라 **바탕과 글자색을 여기서 못박는다** —
 * 소비 앱이 흰 배경을 깔면 커버 아트가 뜨는 게 아니라 지면이 깨진다.
 */
globalStyle('html, body', {
  '@layer': {
    [resetLayer]: {
      margin: 0,
      backgroundColor: vars.color.bg,
      color: vars.color.fg,
      fontFamily: vars.fontFamily.body,
      WebkitFontSmoothing: 'antialiased',
    },
  },
})

globalStyle('*, *::before, *::after', {
  '@layer': { [resetLayer]: { boxSizing: 'border-box' } },
})

globalStyle('h1, h2, h3, p, figure', {
  '@layer': { [resetLayer]: { margin: 0 } },
})

globalStyle('ul, ol', {
  '@layer': { [resetLayer]: { margin: 0, padding: 0, listStyle: 'none' } },
})

globalStyle('img', {
  '@layer': { [resetLayer]: { display: 'block', maxWidth: '100%' } },
})

/**
 * 링크. 기본 파랑/보라 + 밑줄이 남으면 다크 고정 팔레트가 그 자리에서만 깨진다.
 * 색은 부모에서 물려받게 두고, 강조가 필요하면 호출부가 `text` recipe 로 정한다.
 */
globalStyle('a', {
  '@layer': { [resetLayer]: { color: 'inherit', textDecoration: 'none' } },
})
