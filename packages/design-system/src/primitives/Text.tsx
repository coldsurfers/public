import type { CSSProperties, HTMLAttributes } from 'react'
import type { TextStyleName, TextTone } from '../contract/text-style'
import { lineClamp } from '../css/style-utils'
import { text } from '../css/text'
import type { fontWeight } from '../tokens'
import { cx } from './cx'
import { textTone } from './Text.css'

/**
 * 글자 하나를 세우는 바닥.
 *
 * 웹에서 글자는 원래 유틸(`sprinkles`)의 몫이었다 — RN 처럼 모든 글자가 컴포넌트 안에 있어야
 * 하는 제약이 없기 때문이다. 그런데 실측이 그 자유의 값을 보여줬다: `fontSize` 가 들어간 호출
 * 478건에 조합 46가지, 그중 대다수가 행간을 비운 채였다. **고를 것이 많아서 안 고른 것이다.**
 *
 * 그래서 이건 유틸을 대체하는 게 아니라 **기본값을 가진 자리**다. `<Text>` 하나면 크기 · 행간 ·
 * 자간 · 색이 전부 정해진 채로 선다. 한 속성만 달라야 하면 `className` 으로 유틸을 얹는다 —
 * 램프가 `ds-components` 레이어라 유틸이 항상 이긴다.
 *
 * ```tsx
 * <Text>본문</Text>
 * <Text as="h2" textStyle="heading" weight="semibold">섹션 제목</Text>
 * <Text textStyle="label" color="muted" maxLines={2}>두 줄에서 자른다</Text>
 * ```
 *
 * RN 짝은 `./native/Text` 다. 축 이름(`textStyle` · `weight` · `color`)과 램프 표는
 * `contract/text-style.ts` 하나를 같이 읽지만, 구현은 갈린다 — VE 산출물은 CSS 문자열이라
 * RN 으로 넘어가지 않는다.
 */
export type TextTag =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'strong'
  | 'em'
  | 'label'
  | 'dt'
  | 'dd'
  | 'li'
  | 'figcaption'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * 렌더할 태그. 기본 `p`.
   *
   * **크기와 따로 고른다.** `textStyle="heading"` 이 곧 `h2` 는 아니다 — 시각적 크기와 문서
   * 구조는 다른 축이고, 묶으면 "제목처럼 보여야 하는 문단"에서 둘 중 하나를 포기하게 된다.
   */
  as?: TextTag
  /** 램프의 역할 이름. 기본 `body`. 표는 `contract/text-style.ts`. */
  textStyle?: TextStyleName
  /** 굵기. 생략하면 상속 — 램프는 굵기를 정하지 않는다. */
  weight?: keyof typeof fontWeight
  /** 글자색. 생략하면 상속. `subtle` · `faint` 는 읽는 글자에 쓰지 않는다. */
  color?: TextTone
  /** N 줄에서 자르고 말줄임. */
  maxLines?: number
}

export function Text({
  as: Tag = 'p',
  textStyle = 'body',
  weight,
  color,
  maxLines,
  className,
  style,
  ...rest
}: TextProps) {
  // `maxLines` 만 인라인이다 — N 이 열린 값이라 클래스로 미리 구울 수 없다.
  const clamp = maxLines ? (lineClamp(maxLines) as CSSProperties) : undefined

  return (
    <Tag
      className={cx(text(textStyle, { weight }), color && textTone[color], className)}
      style={clamp ? { ...clamp, ...style } : style}
      {...rest}
    />
  )
}
