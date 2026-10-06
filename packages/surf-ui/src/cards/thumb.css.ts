import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'

/** 포스터 칸 공통 — 이미지가 칸을 덮고, 없으면 `CoverBlock` 이 그 자리에 선다. */
export const image = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
)
