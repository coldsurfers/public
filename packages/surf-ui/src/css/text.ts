import type { TextStyleName } from '../contract/text-style'
import type { fontWeight } from '../tokens'
import { textStyleClass, textWeightClass } from './text.css'

/**
 * 램프 클래스를 합치는 얇은 함수. 클래스 자체는 `./text.css.ts` 가 굽는다.
 *
 * 파일이 갈린 이유는 취향이 아니라 제약이다 — `.css.ts` 의 export 는 VE 가 직렬화하므로
 * 함수를 내보낼 수 없다. 그래서 데이터(클래스 맵)와 그걸 읽는 함수가 한 디렉터리에서 갈린다.
 */

export type TextOptions = {
  /** 굵기. 생략하면 상속 — 램프는 굵기를 정하지 않는다. */
  weight?: keyof typeof fontWeight
}

/**
 * 역할 하나를 클래스 문자열로.
 *
 * ```ts
 * text('body')                       // 크기·행간·자간이 한 번에 선다
 * text('label', { weight: 'medium' })
 * ```
 *
 * 램프 밖 크기가 필요하면 덮지 말고 escape hatch 를 쓴다 — `sprinkles({ fontSize: 'lg' })`.
 * 램프 위에 크기만 덮으면 행간·자간이 그 크기에 맞지 않은 채 남는다.
 */
export const text = (name: TextStyleName, options?: TextOptions): string => {
  const weight = options?.weight
  return weight ? `${textStyleClass[name]} ${textWeightClass[weight]}` : textStyleClass[name]
}
