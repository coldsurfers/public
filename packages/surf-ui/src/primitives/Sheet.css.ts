import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/** 시트 패널 — Figma `1028:381`. 모바일은 위만 r28 · 아래 safe-area, 데스크탑은 가운데 모달 최대 560. */
export const panel = style(
  inComponentsLayer({
    borderRadius: `${vars.shape.radiusSheet} ${vars.shape.radiusSheet} 0 0`,
    paddingBottom: 'env(safe-area-inset-bottom)',
    '@media': {
      [media.desktop]: {
        maxWidth: 560,
        borderRadius: vars.shape.radiusSheet,
        paddingBottom: 0,
      },
    },
  }),
)

export const handle = style(
  inComponentsLayer({
    alignSelf: 'center',
    flexShrink: 0,
    width: 36,
    height: 4,
    marginTop: 10,
    borderRadius: vars.shape.radiusPill,
    background: vars.color.panelLine,
    '@media': { [media.desktop]: { display: 'none' } },
  }),
)

export const body = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '18px 21px 24px',
  }),
)
