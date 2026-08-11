import { assignVars, globalStyle } from '@vanilla-extract/css'
import {
  cover,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  paper,
  radius,
  spacing,
  tokens,
} from '../tokens'
import { vars } from './contract.css'
import { tokensLayer } from './layers'
import { declareLayerOrder } from './layers.css'

/**
 * 토큰 **값** 발행. `contract.css` 가 이름만 승격한다면 여기는 그 이름에 값을 넣는다.
 *
 * 값을 TS 객체에서 **읽어서** 넘기므로 SSOT 이중화가 아니다 — 사슬이 한 단계 짧아진다:
 * TS 값 → 생성 CSS → `@import` → 앱 이던 것이 TS 값 → `styles.css` → 앱 이 된다.
 * 소비자는 `.css` 진입점에 `@import` 를 한 줄도 두지 않는다.
 *
 * `createGlobalTheme` 이 아니라 `assignVars` + `globalStyle` 인 이유: 전자는 계약 **전체**를
 * 요구해서 light 블록이 스킴 무관 스케일까지 재선언하게 된다. base/dark/light 분할
 * (스케일은 `:root` 한 번, 색만 스킴별)을 유지하려면 부분 할당이 필요하다.
 *
 * 라이트가 이기는 근거는 소스 순서가 아니라 **상세도**다 — `:root`(0,1,0) < `:root[data-theme]`(0,2,0).
 * 번들러가 청크를 어디에 붙이든 뒤집히지 않는다. (`layers.css.ts` 가 세 번 틀렸던 그 함정이
 * 여기엔 없다.)
 *
 * ⚠️ 이 블록은 **`:root` 에 무조건 발행된다.** 소비자가 값을 바꾸고 싶으면 자기 CSS 에서 같은
 *    커스텀 프로퍼티를 다시 선언하면 된다 — 다만 그게 계약상 허용되는 축인지는 갈린다.
 *    열린 축 / 고정 축 구분은 docs/p1-boundary.md 결정 1.
 */

// 레이어 순서를 **아래 블록보다 먼저** 발행한다. 이 파일의 산출이 최상위 청크에 실리므로,
// 이 한 줄이 "가장 먼저 로드되는 CSS 의 맨 앞은 순서 선언"을 보장한다. 이유는 `layers.css.ts`.
declareLayerOrder()

/** 스킴 무관 스케일 + dark 색. 오늘의 `base.css` + `dark.css` 에 대응. */
globalStyle(':root', {
  '@layer': {
    [tokensLayer]: {
      colorScheme: 'dark',
      vars: {
        ...assignVars(vars.color, tokens.color.semantic.dark),
        ...assignVars(vars.font, fontFamily),
        ...assignVars(vars.fontSize, fontSize),
        ...assignVars(vars.lineHeight, lineHeight),
        ...assignVars(vars.fontWeight, fontWeight),
        ...assignVars(vars.space, spacing),
        ...assignVars(vars.radius, radius),
        ...assignVars(vars.cover, cover),
        ...assignVars(vars.paper, paper),
      },
    },
  },
})

/** light 스킴은 색만 뒤집는다. 스케일은 위 `:root` 것을 그대로 쓴다. */
globalStyle(":root[data-theme='light']", {
  '@layer': {
    [tokensLayer]: {
      colorScheme: 'light',
      vars: assignVars(vars.color, tokens.color.semantic.light),
    },
  },
})
