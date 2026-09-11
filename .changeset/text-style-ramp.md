---
'@coldsurfers/design-system': minor
---

글자의 합성 슬롯을 낸다 — `text(name, { weight })` 와 그 정본인 `TEXT_STYLE_SPEC` 7단계
(`heading` · `title` · `body` · `bodySm` · `label` · `labelSm` · `micro`).

크기 축만 토큰이고 행간·자간을 호출부가 각자 정하면 같은 역할의 글자가 지면마다 다르게 선다.
실측(public + paul-rockstar)에서 `fontSize` 가 들어간 `sprinkles` 호출 478건에 구별되는 조합이
46가지였고, 그중 대다수가 `lineHeight` 를 비운 채였다 — 비우면 상속값이 들어오므로 정해진 적 없는
행간이 화면에 서는 셈이다. 램프 7단계는 그 실측의 크기 분포에서 나왔고, 역할이 서지 않은
`lg`(18px, 8건)는 단계를 주지 않았다.

`fontWeight` 는 묶지 않는다 — 같은 크기에 굵기가 2~3종씩 붙어서 이름에 넣으면 7단계가 21개가
된다. 색도 밖에 둔다. 둘 다 램프와 직교한 축이다.

표는 `contract/text-style.ts` 에 둔다(`CHIP_SPEC` 선례). RN `native/Text` 가 웹과 같은 나이브
모델(`size`·`weight`·`leading` 따로)이라 같은 표를 읽을 자리가 필요하고, VE 산출물은 CSS
문자열이라 RN 으로 못 넘어간다. 이번 판은 웹 레인만 굽는다.

새 진입점은 만들지 않았다 — `text` 는 메인 배럴에서 나간다. `.css.ts` 는 함수를 export 할 수
없어(VE 가 exports 를 직렬화한다) 클래스 맵(`css/text.css.ts`)과 조합 함수(`css/text.ts`)가
갈렸다.
