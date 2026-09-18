import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { editorialType } from '../tokens'

/**
 * uppercase 메타 라벨.
 *
 * **sans 다.** 한때 mono(JetBrains Mono) 였는데, 그건 매거진 콜로폰 톤을 노린 선택이었다.
 * 한국어 라벨(`GENRE · 장르`)이 절반을 차지하는 자리라 Latin 만 mono 로 갈리고 한글은
 * fallback 으로 떨어져 한 줄 안에서 두 폰트가 보였다. 라벨은 본문과 같은 얼굴로 간다.
 *
 * 크기·자간은 `packages/tokens` 의 `editorialType.eyebrow` 를 **그대로 읽는다** — 기존
 * `text-eyebrow-*` Tailwind 유틸이 보던 것과 같은 값이다. 값을 여기 베끼면 SSOT 가 갈라진다.
 * `.css.ts` 는 빌드타임에 실행되므로 이 참조는 산출 CSS 에 리터럴로 굳는다.
 */
const eyebrowType = editorialType.eyebrow

export const eyebrow = recipe({
  base: inComponentsLayer({
    fontFamily: vars.font.sans,
    textTransform: 'uppercase',
  }),

  variants: {
    size: {
      xs: inComponentsLayer({
        fontSize: eyebrowType.xs.fontSize,
        letterSpacing: eyebrowType.xs.letterSpacing,
      }),
      sm: inComponentsLayer({
        fontSize: eyebrowType.sm.fontSize,
        letterSpacing: eyebrowType.sm.letterSpacing,
      }),
      md: inComponentsLayer({
        fontSize: eyebrowType.md.fontSize,
        letterSpacing: eyebrowType.md.letterSpacing,
      }),
    },

    tone: {
      muted: inComponentsLayer({ color: vars.color.muted }),
      subtle: inComponentsLayer({ color: vars.color.subtle }),
      accent: inComponentsLayer({ color: vars.color.accent }),
    },
  },

  defaultVariants: { size: 'md', tone: 'muted' },
})
