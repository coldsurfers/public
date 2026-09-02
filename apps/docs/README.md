# @coldsurfers/docs

`@coldsurfers/design-system` 문서 사이트. Fumadocs(Next.js) + **정적 내보내기**.

```bash
pnpm --filter @coldsurfers/docs... build   # design-system dist 먼저, 그다음 out/
pnpm --filter @coldsurfers/docs dev
```

## 왜 이 사이트가 계약 검증인가

문서의 미리보기는 `@coldsurfers/design-system` 을 **실제로 import 해서** 그린다. 워크스페이스
링크지만 `exports` 맵이 가리키는 곳은 `dist` 라, **exports 에 없는 경로는 여기서도 안 열린다.**
사이트가 빌드된다는 것 자체가 발행 계약이 살아 있다는 증거다.

`Preview` 는 `examples/*.tsx` 파일 하나를 렌더링과 코드 블록 양쪽에 쓴다 — 문서에 적힌 코드와
화면이 어긋나려면 파일이 둘이어야 하는데, 하나다.

props 표도 옮겨 적지 않는다. `Props` 가 DS 소스의 타입에서 뽑고, 토큰 표(`Swatches`)는
`@coldsurfers/design-system/tokens` 에서 값을 읽는다.

## 서버가 없다

`output: 'export'` 다. 검색 인덱스까지 빌드 산출물(`/api/search`)이고 브라우저가 계산한다
(`orama-static`). 그래서 `out/` 을 Cloudflare Workers 정적 자산으로 그대로 올린다 —
OpenNext 도, 런타임 Node 도 없다.

## CSS 순서

`app/layout.tsx` 의 import 순서가 캐스케이드다.

```
global.css (tailwind + fumadocs preset) → design-system/styles.css → ds-bridge.css
```

DS 가 뒤에 오는 건 `LAYER_ORDER` 가 `base`(Tailwind preflight)를 `ds-components` 앞에 두기
때문이고, `ds-bridge.css` 가 마지막인 건 `ds-reset` 이 잡은 `body` 를 문서 크롬으로 되돌려야
해서다. 되돌리는 규칙은 **레이어 밖**이라 어떤 `@layer` 보다 강하다.

미리보기 표면은 `.ds-surface` 안에서 다시 DS 값으로 돌아간다.

## LLM 이 읽는 사본

UI 에 링크가 없는 평문 라우트다. 페이지 헤더의 복사 버튼과 "Open in ChatGPT/Claude" 가 이걸 가리킨다.

| URL | 무엇 |
| --- | --- |
| `/llms/components/badge.txt` | 페이지 하나 — **컴포넌트 단위**가 파일 하나다 |
| `/llms.txt` | 색인. 링크는 위 `.txt` 로 간다 (HTML 로 보내면 마크업을 준 셈이다) |

마지막 세그먼트에 확장자를 붙이는 게 조건이다 — 없으면 정적 내보내기가 디렉터리
(`badge/index.html`)로 떨어뜨려서 `.txt` 한 방에 못 가져간다.

페이지 헤더의 `Open ▾` 는 **그 페이지의 `.txt` 하나**를 연다(`Open button.txt`). 사이트 전체인
`/llms.txt` 는 루트에서 줍는 것이라 이 메뉴에 넣지 않는다.

그 드롭다운은 `components/page-actions.tsx` 가 **우리 것**이다 — fumadocs 의
`ViewOptionsPopover` 는 목록이 컴포넌트 안에 박혀 있어 항목을 더할 수 없다(업스트림도 가져다
쓰라고 안내한다). 팝오버·버튼 스타일만 빌려오고 목록은 여기서 정한다.

## sitemap

`app/sitemap.ts` 가 `/sitemap.xml` 을 빌드 산출물로 떨어뜨린다. 목록은 `source` 에서 뽑으므로
**경로를 옮겨 적지 않는다** — 페이지를 더하면 따라오고, 지우면 같이 사라진다.

`<loc>` 에 절대 주소가 필요해서 `lib/shared.ts` 의 `siteUrl` 을 쓴다. 그 값은 `wrangler.jsonc`
의 `routes` 와 **같은 주소여야 한다** — 한쪽만 바꾸면 배포는 성공하고 sitemap 만 조용히 다른
도메인을 가리킨다. 리포지터리 변수 `DOCS_SITE_URL` 로 덮을 수 있다(미리보기 배포용).

## 배포

`https://design.coldsurf.io` — `wrangler.jsonc` 의 `routes` 가 커스텀 도메인을 잡는다.
`custom_domain: true` 라 첫 배포 때 wrangler 가 DNS 레코드와 인증서까지 만든다. 전제는
`coldsurf.io` 존이 같은 계정에 있는 것.

`.github/workflows/docs.yml` — **수동 트리거(`workflow_dispatch`)만** 있다. 시크릿 둘이 필요하다.

| 이름 | 무엇 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Workers Scripts:Edit **+ Zone:DNS:Edit** (커스텀 도메인이 존을 건드린다) |
| `CLOUDFLARE_ACCOUNT_ID` | 계정 ID |

없으면 배포 스텝을 건너뛴다. 로컬에서는 `pnpm --filter @coldsurfers/docs deploy`.
