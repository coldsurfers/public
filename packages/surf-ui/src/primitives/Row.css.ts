import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 목록 한 줄. 줄 사이 선은 윗선이고 첫 줄은 지운다 — 카드 안에서 위 테두리와 겹치지 않게. */
export const row = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['4'],
    paddingBlock: vars.space['4'],
    borderTop: `1px solid ${vars.color.borderSoft}`,
    color: vars.color.text,
    textDecoration: 'none',
    selectors: { '&:first-child': { borderTop: 'none' } },
  }),
)

/** 지난 줄은 앞 칸과 글만 흐린다 — 오른쪽 `종료` 표시는 또렷해야 읽힌다. */
export const rowDim = style(inComponentsLayer({ opacity: 0.45 }))

export const rowLead = style(inComponentsLayer({ flexShrink: 0 }))

export const rowText = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
    flex: 1,
    minWidth: 0,
  }),
)

export const rowTitle = style(
  inComponentsLayer({
    fontSize: vars.fontSize.base,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: vars.letterSpacing.normal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)

export const rowSub = style(
  inComponentsLayer({ fontSize: vars.fontSize.sm, color: vars.color.muted }),
)

export const rowTrail = style(
  inComponentsLayer({ display: 'inline-flex', flexShrink: 0, color: vars.color.muted }),
)

/** `19:30` — 숫자는 Geist. 폭을 고정해 줄마다 제목이 같은 세로선에 선다. */
export const rowTime = style(
  inComponentsLayer({
    width: 72,
    fontFamily: vars.font.geist,
    fontSize: vars.fontSize.xl,
    fontWeight: vars.fontWeight.semibold,
    letterSpacing: vars.letterSpacing.tight,
  }),
)

/** `SAT 03` 블록. */
export const rowDate = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 62,
    borderRadius: vars.radius.xl,
    background: vars.color.surfaceGhost,
    fontFamily: vars.font.geist,
  }),
)

export const rowDateDow = style(
  inComponentsLayer({
    fontSize: vars.fontSize['3xs'],
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: vars.color.muted,
  }),
)

export const rowDateDay = style(
  inComponentsLayer({ fontSize: vars.fontSize.xl, fontWeight: vars.fontWeight.semibold }),
)
