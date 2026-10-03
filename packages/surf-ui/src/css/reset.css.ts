import { globalStyle } from '@vanilla-extract/css'
import { vars } from './contract.css'
import { resetLayer } from './layers'
import { declareLayerOrder } from './layers.css'

/**
 * 전 앱 공통 엘리먼트 기본값.
 *
 * **여기 담긴 건 실측된 공통분모뿐이다** (2026-08-03, Vite 앱 4곳 대조):
 * `box-sizing` + `body` 4속성. 그 이상은 앱마다 갈리므로 앱에 남긴다 —
 *
 * - `line-height` · `a { color: inherit }` … `cockpit` 만
 * - `html,body { height: 100% }` · `:focus-visible` 링 · 폰트 스무딩 … `atlas` 만
 * - 바닥색 `--paper-warm` … `personal-site` 만 (`--bg` 와 **다른 표면**이다)
 *
 * 공유할 가치는 이 10줄이 아니라 그 위에 쌓을 layer·recipe 규약이다. 여기에 "대부분의 앱이 쓰니까"
 * 를 근거로 규칙을 늘리면 나머지 앱에 **시각 회귀**가 된다 — 순수 재저작 전제가 깨진다.
 *
 * 순서 선언을 **이 파일에서도 한 번 더** 발행한다. `contract.css` → `layers.css` 경로로 딸려오긴
 * 하지만 그건 공유 모듈이라 번들러가 어느 한 청크에만 넣고, 그 청크가 먼저 로드된다는 보장이 없다
 * (이유·실측은 `layers.css.ts` 주석). 재선언은 no-op 이라 중복이 안전하다.
 */

declareLayerOrder()

globalStyle('*', {
  '@layer': {
    [resetLayer]: { boxSizing: 'border-box' },
  },
})

globalStyle('body', {
  '@layer': {
    [resetLayer]: {
      margin: 0,
      background: vars.color.bg,
      color: vars.color.text,
      fontFamily: vars.font.sans,
    },
  },
})
