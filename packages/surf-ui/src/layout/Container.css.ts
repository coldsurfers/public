import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/**
 * 표면 gutter — 헤더 로고와 각 표면 콘텐츠를 같은 세로선에 세우는 축.
 *
 * `1440px` 은 스케일 밖 리터럴이다. 토큰에 `maxWidth` 축이 없고, 이 값은 *한 표면의 최대 폭*
 * 이라는 레이아웃 결정이라 스케일로 일반화할 게 없다(`Button` 의 `15px` 과 같은 판정).
 * 다른 폭이 필요하면 `className` 으로 덮는다 — 유틸(`ds-utilities`)이 항상 이긴다.
 *
 * 패딩을 `sprinkles` 대신 여기서 미디어 쿼리로 쓴 이유: `sprinkles()` 런타임은 JS 38 kB 다.
 * gutter 하나 때문에 `./layout` 소비자 전원에게 그걸 물릴 수 없다(#19 D-7).
 */
export const container = style(
  inComponentsLayer({
    marginInline: 'auto',
    width: '100%',
    maxWidth: '1440px',
    paddingInline: vars.space['6'],
    '@media': {
      [media.tablet]: { paddingInline: vars.space['16'] },
    },
  }),
)
