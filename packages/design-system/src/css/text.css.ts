import { styleVariants } from '@vanilla-extract/css'
import { TEXT_STYLE_SPEC, type TextStyleName, type TextStyleSpec } from '../contract/text-style'
import { fontWeight } from '../tokens'
import { inComponentsLayer } from './component-layer'
import { vars } from './contract.css'

/**
 * 글자 한 덩어리를 **역할 이름 하나로** 고르게 하는 자리.
 *
 * 램프의 정본은 `contract/text-style.ts` 다 — 왜 7단계인지, 왜 weight 를 안 묶는지가 거기 있다.
 * 이 파일은 그 표를 웹 클래스로 굽기만 한다. 표를 여기로 옮기면 RN 레인이 못 읽는다(VE 산출물은
 * CSS 문자열이고 RN 엔 그걸 받을 곳이 없다 — `contract/index.ts` 의 공유선 표).
 *
 * ## 왜 `sprinkles` 가 아닌가
 *
 * sprinkles 는 **한 키 = 한 속성**이다. 세 속성을 한 이름으로 묶는 건 그 모델 밖이라
 * `styleVariants` 로 내려왔다. 대신 이쪽은 반응형 조건을 갖지 않는다 — 역할이 breakpoint 마다
 * 바뀐다면 그건 다른 역할이다.
 *
 * ## 레이어
 *
 * `ds-components` 다. 호출자가 얹는 sprinkles 유틸이 더 뒤 레이어라 **항상 이긴다** —
 * `text('body')` 로 바닥을 깔고 `sprinkles({ color: 'muted' })` 로 한 속성만 덮는 게 성립한다.
 * 반대로 두면 램프가 유틸을 이겨서 호출부의 예외가 조용히 죽는다.
 *
 * ## 왜 클래스 맵만 여기 있나
 *
 * `.css.ts` 의 export 는 VE 가 **직렬화**한다 — 평범한 객체·배열·문자열·숫자만 나갈 수 있고
 * 함수는 빌드가 거부한다(`Invalid exports`). 그래서 이 파일은 맵까지만 내고, 둘을 합치는
 * `text()` 는 옆의 plain `./text.ts` 가 맡는다.
 */
export const textStyleClass: Record<TextStyleName, string> = styleVariants(
  TEXT_STYLE_SPEC,
  (spec: TextStyleSpec) =>
    inComponentsLayer({
      fontSize: vars.fontSize[spec.fontSize],
      lineHeight: vars.lineHeight[spec.lineHeight],
      letterSpacing: vars.letterSpacing[spec.letterSpacing],
    }),
)

/**
 * weight 는 램프와 직교한 축이다(근거는 `contract/text-style.ts`). 같은 역할의 글자가
 * 강조 때문에 다른 크기로 가면 안 되므로, 굵기만 갈아끼운다.
 */
export const textWeightClass: Record<keyof typeof fontWeight, string> = styleVariants(
  fontWeight,
  (value) => inComponentsLayer({ fontWeight: value }),
)
