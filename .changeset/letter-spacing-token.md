---
'@coldsurfers/design-system': minor
---

본문·UI 자간 축을 토큰으로 낸다 — `letterSpacing` 3단계(`none` · `normal` · `tight`)와
`--letter-spacing-*` 변수, `sprinkles({ letterSpacing })`.

지금까지 `editorialType` 3그룹(eyebrow · display · caption)만 `letterSpacing` 을 갖고 있어서
본문·UI 는 브라우저 기본값(0)이었다. Pretendard 로 한글을 0 에 두면 같은 크기에서 라틴보다
헐렁하게 읽혀, 소비처가 자기 CSS 로 이 자리를 메우고 있었다. 반응형 축으로는 열지 않았다 —
자간은 폭이 바뀌어도 같이 움직일 이유가 없다.

`editorialType` 의 자간과는 겹치지 않는다. 저쪽은 크기까지 묶은 합성 슬롯이고 이쪽은 어느
크기에든 얹는 단일 속성이라, 합성 슬롯을 쓰는 자리에선 이 토큰을 덧대지 않는다.

`color.subtle` 은 값이 그대로다. 다만 **읽는 글자에 쓸 수 없다**는 경계를 토큰 주석과
`foundations/colors` 에 적었다 — 실측이 `surface` 위 2.34:1 로 WCAG AA(4.5:1) 밖이고, 보조
문구까지 `muted` 가 하한이다. 값을 옮기지 않은 이유는 구분선 · 비활성 자리에선 지금 값이 맞고
소비처가 165곳이라 읽는 글자가 아닌 자리까지 같이 움직이기 때문이다.

근거 · 실측: coldsurfers/public#106
