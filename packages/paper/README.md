# @coldsurfers/paper

마크다운을 **지면으로 굽는** CLI. 산출물은 PDF 하나다.

```bash
paper build a.md         # 설정 없이 바로
paper build              # 설정의 files 를 전부
paper watch              # 저장하면 다시 굽는다
paper check              # 없는 이미지 · 빈 장을 찾는다 (있으면 exit 1)
```

PDF 는 문서 옆 `pdf/` 에 떨어진다.

## Chromium

**브라우저를 내려받지 않는다.** 깔려 있는 것을 찾아 쓴다 — macOS · Windows · Linux 의 표준
설치 경로를 훑고, Chrome 이 없으면 Chromium 이나 Edge 도 받는다.

경로를 직접 주려면 둘 중 하나다. 앞의 것이 이긴다.

```bash
PAPER_CHROME_PATH=/path/to/chrome paper build a.md
```

```json
{ "chromePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" }
```

환경변수가 설정보다 앞인 이유는 **커밋되지 않는 값이기 때문**이다. 실행 경로는 기계마다
다른데 설정 파일은 레포에 들어간다 — 팀이 공유하는 설정을 개인 기계가 덮을 수 있어야 한다.

## 설정

**없어도 된다.** 매번 같은 문서 묶음을 굽는 소비처의 편의 수단이다. 기본은
`paper.config.json` 이고 `--config <경로>` 로 바꾼다. 필드는 전부 선택이다.

```json
{
  "docsDir": "docs",
  "outDir": "docs/pdf",
  "theme": "coldsurf",
  "page": { "format": "A4", "marginY": 14, "marginX": 12 },
  "files": ["one.md", "two.md"],
  "overrides": { "wide.md": { "format": "A3" } }
}
```

**인자로 준 경로는 실행 위치 기준, 설정의 `files` 는 `docsDir` 기준이다.** 셸에서 탭 완성으로
얻는 경로는 실행 위치 기준이고, 설정에 적는 목록은 그 설정이 가리키는 디렉터리 기준이다.

`theme` 은 `coldsurf` 이거나 테마 CSS 파일 경로다. 무엇을 채워야 하는지는
`src/tokens/contract.ts` 가 목록으로 갖고 있다.

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
