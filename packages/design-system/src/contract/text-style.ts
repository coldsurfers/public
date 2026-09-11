import type { fontSize, letterSpacing, lineHeight } from '../tokens'

/**
 * 글자 한 덩어리의 **합성 슬롯**. 규율은 `./index.ts`.
 *
 * ## 왜 합성인가
 *
 * 크기 축만 토큰이고 행간·자간은 호출부가 각자 정하면, 같은 역할의 글자가 지면마다 다르게
 * 선다. 실측(2026-09-11, public + paul-rockstar)이 그대로 보여준다 — `fontSize` 가 들어간
 * `sprinkles` 호출 **478건**에 구별되는 조합이 **46가지**였고, 그중 대다수가 `lineHeight` 를
 * 아예 비운 채였다. 비우면 상속값이 들어오므로 *정해진 적 없는 행간*이 화면에 서는 셈이다.
 *
 * 자간도 같은 자리에서 같은 병을 앓았다(coldsurfers/public#106). 세 속성을 한 이름으로 묶으면
 * 고를 것이 크기 하나가 아니라 **역할 하나**가 된다.
 *
 * ## 무엇이 묶이고 무엇이 안 묶이나
 *
 * `fontSize` · `lineHeight` · `letterSpacing` 셋만 묶는다. **`fontWeight` 는 별도 축**이다 —
 * 실측에서 같은 크기에 weight 가 2~3종씩 붙었고(예: `sm` 이 regular 88 · medium 35 ·
 * semibold 15), 이름에 넣으면 7단계가 21개가 된다. 그건 램프가 아니라 목록이다.
 * 색도 안 묶는다. 같은 역할의 글자가 표면에 따라 `body`·`muted` 로 갈리는 건 정상이다.
 *
 * ## 램프는 지어낸 것이 아니다
 *
 * 아래 7단계는 위 실측의 크기 분포에서 나왔다. 괄호는 그 크기의 실사용 건수다.
 *
 * | 이름 | fontSize | 실사용 | 자리 |
 * | --- | --- | --- | --- |
 * | `heading` | `2xl` 24px | 7 | 섹션 제목 |
 * | `title` | `xl` 20px | 11 | 카드·블록 제목 |
 * | `body` | `base` 16px | 56 | 읽는 본문 |
 * | `bodySm` | `sm` 14px | 150 | 보조 본문 · UI 문장 |
 * | `label` | `xs` 12px | 152 | 라벨 · 메타 |
 * | `labelSm` | `2xs` 11px | 29 | 좁은 라벨 · 수치 |
 * | `micro` | `3xs` 10px | 27 | 마이크로 라벨 |
 *
 * `lg`(18px)는 램프에 없다 — 실사용 8건이 `body`와 `title` 사이에 흩어져 있어 역할이 서지
 * 않았다. 단계를 늘리는 대신 그 자리는 escape hatch(`sprinkles({ fontSize: 'lg' })`)로 둔다.
 * `fontSize` 문서가 12.5~17px 을 네 단계로 접은 것과 같은 판단이다.
 *
 * ## `editorialType` 과 겹치지 않는다
 *
 * 저쪽도 합성 슬롯이지만 **매거진 지면의 고정 축**이다(uppercase eyebrow · clamp display ·
 * caption). 크기가 clamp 이거나 `textTransform` 을 포함해서, 어느 크기에든 얹는 이 램프와
 * 축이 다르다. 한 글자에 둘을 겹쳐 쓰지 않는다 — 쓰는 쪽이 갈리면 자간이 두 번 정해진다.
 */
export type TextStyleName = 'heading' | 'title' | 'body' | 'bodySm' | 'label' | 'labelSm' | 'micro'

type FontSizeKey = keyof typeof fontSize
type LineHeightKey = keyof typeof lineHeight
type LetterSpacingKey = keyof typeof letterSpacing

export type TextStyleSpec = {
  fontSize: FontSizeKey
  lineHeight: LineHeightKey
  letterSpacing: LetterSpacingKey
}

/**
 * 역할 → 세 토큰 키. **두 레인의 정본**이다 — 웹은 `css/text.css.ts` 가 `vars` 로,
 * RN 은 `tokens/native` 의 절대값 변환으로 같은 표를 읽는다.
 *
 * 행간이 위로 갈수록 좁아지는 이유: 큰 글자는 같은 배수여도 줄 사이가 넓어 보인다.
 * 자간이 `heading` 에서만 `tight` 인 이유도 같다 — 24px 미만에서는 `normal` 이 이미 충분히
 * 조여 보이고, 더 조이면 한글 받침이 붙는다.
 */
export const TEXT_STYLE_SPEC: Record<TextStyleName, TextStyleSpec> = {
  heading: { fontSize: '2xl', lineHeight: 'tight', letterSpacing: 'tight' },
  title: { fontSize: 'xl', lineHeight: 'snug', letterSpacing: 'normal' },
  body: { fontSize: 'base', lineHeight: 'relaxed', letterSpacing: 'normal' },
  bodySm: { fontSize: 'sm', lineHeight: 'normal', letterSpacing: 'normal' },
  label: { fontSize: 'xs', lineHeight: 'snug', letterSpacing: 'normal' },
  labelSm: { fontSize: '2xs', lineHeight: 'snug', letterSpacing: 'normal' },
  micro: { fontSize: '3xs', lineHeight: 'snug', letterSpacing: 'normal' },
}
