import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { srOnly } from './Spinner.css'

/**
 * 네이티브 `<input type="checkbox">` 를 감추고 형제 박스를 칠한다.
 *
 * Tailwind 에서는 `peer` + `peer-checked:` 로 표현하던 관계다. VE 에는 marker 클래스가 필요 없다 —
 * **형제 셀렉터를 그대로 쓴다**(`input:checked + &`). 관계가 클래스 이름에 숨지 않고 셀렉터에
 * 드러나므로 읽는 사람이 마크업 구조를 유추하지 않아도 된다.
 */
export const checkboxLabel = style(
  inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: 8,
    cursor: 'pointer',
  }),
)

/** 시각은 형제 박스가 든다. 네이티브 input 은 접근성·키보드·폼 제출만 맡고 화면에서 사라진다. */
export const checkboxInput = srOnly

export const checkboxBox = style(
  inComponentsLayer({
    marginTop: 1,
    display: 'flex',
    width: 18,
    height: 18,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    color: 'transparent',
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: '150ms',

    selectors: {
      'input:checked + &': {
        borderColor: vars.color.accent,
        background: vars.color.accent,
        color: 'white',
      },
      'input:focus-visible + &': {
        // ring-accent/60 등가. `var()` 에 알파를 먹이려면 color-mix 가 필요하다.
        boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.color.accent} 60%, transparent)`,
      },
      'input:disabled + &': { opacity: 0.5 },
    },
  }),
)

export const checkboxMark = style(inComponentsLayer({ width: 12, height: 12 }))

export const checkboxText = style(inComponentsLayer({ lineHeight: vars.lineHeight.snug }))
