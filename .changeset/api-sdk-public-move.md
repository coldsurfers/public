---
'@coldsurfers/api-sdk': major
---

`@coldsurfers/api-sdk` 를 public 레포로 옮기고 **소스가 아니라 `dist` 를 발행한다.**

진입점을 **의존성 경계**로 다시 그었다 — 루트 `.` 이 react-query 를 런타임으로 물고 있어서, DTO 타입 하나 쓰려는 소비자가 UI 런타임까지 지고 있었다.

| 진입점 | 내용 | peer |
| --- | --- | --- |
| `.` | `types/*` · `ApiSdk` · `getApiClient` · `OpenApiError` | `openapi-fetch` |
| `./react` | `createPageQueries` · `createSuspenseCursorInfiniteQuery` · providers · hoc | + `react` · `@tanstack/react-query` |
| `./queries` | 도메인 훅 (feed · notification) | + 위 |
| `./client` | 웹 auth 미들웨어 | `openapi-fetch` |

**breaking**

- `./providers` · `./hoc` → `./react` 로 합쳤다
- `./next` 제거 — 실사용 0곳
- `./client/native` 제거 — `@coldsurfers/native-auth`(비공개)를 물어서 공개 패키지가 될 수 없다
- `ts-pattern` peer 제거 (호출 1곳을 평문 분기로)
- `FeedBlogArticleDTOSchema` → `FeedEditorialDTOSchema` (`BLOG_ARTICLE` → `EDITORIAL`)
