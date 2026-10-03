import { styleVariants } from '@vanilla-extract/css'
import type { TextTone } from '../contract/text-style'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * `Text` 의 색 축. 크기·행간·자간은 여기 없다 — 그건 `css/text.css.ts` 의 램프가 맡고,
 * `Text` 가 둘을 합쳐 쓴다. 한 컴포넌트의 클래스를 한 파일에 몰지 않는 이유는, 램프가
 * `Text` 것이 아니기 때문이다. `text()` 를 직접 쓰는 표면도 같은 클래스를 문다.
 */
export const textTone: Record<TextTone, string> = styleVariants({
  text: inComponentsLayer({ color: vars.color.text }),
  strong: inComponentsLayer({ color: vars.color.strong }),
  body: inComponentsLayer({ color: vars.color.body }),
  muted: inComponentsLayer({ color: vars.color.muted }),
  subtle: inComponentsLayer({ color: vars.color.subtle }),
  faint: inComponentsLayer({ color: vars.color.faint }),
  accent: inComponentsLayer({ color: vars.color.accent }),
})
