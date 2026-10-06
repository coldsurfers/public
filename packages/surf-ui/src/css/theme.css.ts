import { assignVars, globalStyle } from '@vanilla-extract/css'
import {
  breakpoints,
  colorSchemes,
  cover,
  fontFamily,
  fontSize,
  fontWeight,
  layout,
  letterSpacing,
  lineHeight,
  radius,
  type Surface,
  shadow,
  shape,
  spacing,
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
 * **색은 면 단위 두 벌이다.** `:root` 는 light, `[data-surface="ink"]` 를 단 요소 안은 ink.
 * 한 페이지 안에서 섞는다(홈: 히어로 ink → 아래 묶음 light). `[data-surface="light"]` 는 ink 안에서
 * 다시 밝은 면을 여는 자리다. OS 다크모드(`prefers-color-scheme`)를 따르는 건 `[data-surface="auto"]` 하나뿐이다.
 *
 * **layout 은 폭 두 벌이다.** `:root` 는 mobile, `breakpoints.desktop` 이상은 desktop.
 *
 * `createGlobalTheme` 이 아니라 `assignVars` + `globalStyle` 인 이유: 전자는 계약 **전체**를
 * 한 번에 요구하는데, 여기는 `cover`·`paper` 처럼 성격이 다른 축을 같은 블록에 섞어 넣는
 * 자리라 부분 할당이 읽기 쉽다.
 *
 * ⚠️ 이 블록은 **`:root` 에 무조건 발행된다.** 소비자가 값을 바꾸고 싶으면 자기 CSS 에서 같은
 *    커스텀 프로퍼티를 다시 선언하면 된다 — 다만 그게 계약상 허용되는 축인지는 갈린다.
 *    열린 축 / 고정 축 구분은 docs/p1-boundary.md 결정 1.
 */

// 레이어 순서를 **아래 블록보다 먼저** 발행한다. 이 파일의 산출이 최상위 청크에 실리므로,
// 이 한 줄이 "가장 먼저 로드되는 CSS 의 맨 앞은 순서 선언"을 보장한다. 이유는 `layers.css.ts`.
declareLayerOrder()

const scheme = (surface: Surface) => ({
  colorScheme: surface === 'ink' ? 'dark' : 'light',
  vars: assignVars(vars.color, colorSchemes[surface]),
})

const surfaceBlock = (surface: Surface) => ({ '@layer': { [tokensLayer]: scheme(surface) } })

/** 스케일 + light 색 + mobile layout. */
globalStyle(':root', {
  '@layer': {
    [tokensLayer]: {
      colorScheme: 'light',
      vars: {
        ...assignVars(vars.color, colorSchemes.light),
        ...assignVars(vars.layout, layout.mobile),
        ...assignVars(vars.shape, shape),
        ...assignVars(vars.font, fontFamily),
        ...assignVars(vars.fontSize, fontSize),
        ...assignVars(vars.lineHeight, lineHeight),
        ...assignVars(vars.letterSpacing, letterSpacing),
        ...assignVars(vars.fontWeight, fontWeight),
        ...assignVars(vars.space, spacing),
        ...assignVars(vars.radius, radius),
        ...assignVars(vars.cover, cover),
        ...assignVars(vars.shadow, shadow),
      },
      '@media': {
        [`(min-width: ${breakpoints.desktop})`]: {
          vars: assignVars(vars.layout, layout.desktop),
        },
      },
    },
  },
})

// 면 단위 스킴. `:root` 블록보다 **뒤에** 발행해야 같은 상세도(0,1,0)에서 이긴다.
globalStyle('[data-surface="ink"]', surfaceBlock('ink'))
globalStyle('[data-surface="light"]', surfaceBlock('light'))
// OS 를 따르는 면 — 기본 light, OS 가 다크면 ink. 토글은 없다.
globalStyle('[data-surface="auto"]', {
  '@layer': {
    [tokensLayer]: {
      ...scheme('light'),
      '@media': { '(prefers-color-scheme: dark)': scheme('ink') },
    },
  },
})
