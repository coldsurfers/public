# @coldsurfers/paper

마크다운을 **지면으로 굽는** CLI. 산출물은 PDF 하나다.

```bash
paper build              # 설정의 files 를 전부 굽는다
paper build a.md b.md    # 이것만
paper watch              # 저장하면 다시 굽는다
paper check              # 없는 이미지 · 빈 장을 찾는다 (있으면 exit 1)
```

설정은 `paper.config.json` 에서 읽는다. `--config <경로>` 로 바꾼다.

```json
{
  "docsDir": "docs",
  "outDir": "docs/pdf",
  "theme": "coldsurf",
  "chromePath": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "page": { "format": "A4", "marginY": 14, "marginX": 12 },
  "files": ["one.md", "two.md"],
  "overrides": { "wide.md": { "format": "A3" } }
}
```

`theme` 은 `coldsurf` 이거나 테마 CSS 파일 경로다. 무엇을 채워야 하는지는
`src/tokens/contract.ts` 가 목록으로 갖고 있다.

**브라우저를 내려받지 않는다.** `chromePath` 가 가리키는 Chromium 을 쓴다 — 발행 패키지가
250MB 를 강제하지 않는 자리다.

## 왜 있는가

소비 레포마다 `md-to-pdf` 래퍼 스크립트를 각자 포크해 들고 있었고, 그 안에 디자인 토큰 값이
손으로 베껴 박혀 있었다. 값을 베껴 심는 구조라 한쪽을 고쳐도 다른 쪽은 그대로 남는다 —
실제로 인쇄 페이지 브레이크 규칙이 한쪽에만 있었다.

`paper` 는 인쇄용 시맨틱 계약만 정의하고, 값은 `@coldsurfers/design-system/tokens` 에서 파생한다.

## 테마

브랜드 테마 프리셋은 **여기 들어 있지 않다.** `coldsurf` 하나만 발행하고, 나머지는 소비처가
설정에서 CSS 경로로 주입한다. 소비처가 자기 표면 색으로 만든 테마는 그 레포의 것이다.

## check 가 보는 것

- **없는 이미지** — 문서만 읽고 잡는다. 렌더하면 깨진 아이콘이 지면에 그대로 실린다
- **빈 장** — 결과 PDF 의 각 장에서 글자·이미지 연산자를 센다. 빈 장은 인쇄 엔진이 만든
  결과라 DOM 이 아니라 결과물을 봐야 한다

## 상태

남은 체크리스트는 [coldsurfers/public#124](https://github.com/coldsurfers/public/issues/124) 에 있다.
