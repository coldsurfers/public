# @coldsurfers/paper

마크다운을 **지면으로 굽는** CLI. 산출물은 PDF 하나다.

```bash
paper --help
```

## 왜 있는가

소비 레포마다 `md-to-pdf` 래퍼 스크립트를 각자 포크해 들고 있었고, 그 안에 디자인 토큰 값이
손으로 베껴 박혀 있었다. 값을 베껴 심는 구조라 한쪽을 고쳐도 다른 쪽은 그대로 남는다 —
실제로 인쇄 페이지 브레이크 규칙이 한쪽에만 있었다.

`paper` 는 인쇄용 시맨틱 계약만 정의하고, 값은 `@coldsurfers/design-system/tokens` 에서 파생한다.

## 테마

브랜드 테마 프리셋은 **여기 들어 있지 않다.** `coldsurf` 하나만 발행하고, 나머지는 소비처가
설정에서 CSS 경로로 주입한다. 소비처가 자기 표면 색으로 만든 테마는 그 레포의 것이다.

## 상태

뼈대 단계다. 커맨드 · 설정 스키마 · 체크리스트는
[coldsurfers/public#124](https://github.com/coldsurfers/public/issues/124) 에 있다.
