# coldsurfers/public

COLDSURF 이 밖으로 내보내는 패키지들이 사는 곳. 열이다.

전부 `@coldsurfers` 스코프로 **GitHub Packages** 에 발행된다. 루트만 `private` 이고,
`packages/*` 는 소비처가 레지스트리에서 물어간다.

> **범용 라이브러리가 아니다.** 공개하되 COLDSURF 서비스에 정합된 물건이다. 디자인 시스템은
> 브랜드 값(accent · paper · cover 톤)이 기본값으로 딸려오고, 데이터 모델은 COLDSURF 의 와이어
> 계약이다. 목표는 "누구나 쓸 수 있게 범용화" 가 아니라 "재활용 가능한 것을 잘 옮기는 것" 이다.

## 패키지

| 패키지 | 무엇 |
| --- | --- |
| [`design-system`](packages/design-system) | 토큰 값 · CSS 계약(vanilla-extract) · React primitives · 카드 · 네이티브 레인 |
| [`tailwind4-theme`](packages/tailwind4-theme) | 같은 토큰을 Tailwind v4 `@theme` 레이어로 |
| [`markdown-renderer`](packages/markdown-renderer) | 마크다운 → 산문 표면(shiki 하이라이팅 · 미디어 임베드) |
| [`design-system-mcp`](packages/design-system-mcp) | 디자인 시스템 문서를 물어보는 MCP 서버 (`coldsurf-ds-mcp`) |
| [`data-models`](packages/data-models) | zod 스키마 · DTO — 서버 · 웹 · 네이티브 사이의 와이어 계약 |
| [`api-sdk`](packages/api-sdk) | billets API 의 타입 세이프 SDK (`./client` · `./queries` · `./react`) |
| [`auth-client`](packages/auth-client) | coldsurf-auth-server SDK. 토큰 저장소를 갈아끼운다(cookie · localStorage · expo-secure-store · memory) |
| [`shared-utils`](packages/shared-utils) | 프레임워크 무관 헬퍼. 진입점이 곧 모듈이다(`./date` · `./slug` · `./seo-head` …) |
| [`react-native-mf`](packages/react-native-mf) | RN 마이크로프론트엔드 — 원격 번들을 호스트 JS 런타임에 얹는다 |
| [`paper`](packages/paper) | 마크다운 → PDF CLI. 디자인 시스템 토큰으로 찍는다 (`paper`) |

문서 사이트는 [`apps/docs`](apps/docs) 다 — 발행되지 않는 워크스페이스고, 발행되는 `dist` 를
물어서 그린다. 사이트가 빌드된다는 건 `exports` 계약이 살아 있다는 뜻이다.
배포본은 [design.coldsurf.io](https://design.coldsurf.io).

`design-system` 과 `markdown-renderer` 를 가른 축은 **무게**다. shiki 는 모듈 최상단
부수효과라 번들러가 못 털고, DS 는 CSS 가 한 장이라 안 쓰는 소비자도 지불한다. 그래서 진입점째
갈랐다 — import 안 하면 0 바이트.

## 쓰기

GitHub Packages 라서 스코프를 먼저 물려준다. 토큰은 `read:packages` 면 된다.

```ini
# .npmrc
@coldsurfers:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
pnpm add @coldsurfers/design-system
```

```ts
import { vars } from '@coldsurfers/design-system'
import { spacing } from '@coldsurfers/design-system/tokens'
import { Button } from '@coldsurfers/design-system/primitives'
```

`.css.ts` 는 이 레포에서 컴파일해 내보낸다. 소비자 쪽에 vanilla-extract 번들러 플러그인은
**필요 없고, CSS 배선도 없다** — 진입점이 `styles.css` 를 직접 물고 온다.

## 개발

```bash
pnpm install
pnpm build          # turbo run build (패키지 dist + 문서 out)
pnpm check:type     # turbo run check:type
pnpm check:exports  # 발행될 exports·d.ts 를 attw 로 해석해본다
pnpm test           # turbo run test
pnpm check          # biome check .

pnpm --filter @coldsurfers/docs dev   # 문서 사이트
```

Node 22 · pnpm 10. CI 가 도는 것과 같은 순서다.

## 릴리스

패키지를 만진 PR 은 `pnpm changeset` 으로 변경 기록을 남긴다.
main 에 머지되면 Release 워크플로가 version PR 을 열고, 그 PR 이 머지되는 순간 발행된다.

머지 전에 실제 레지스트리로 물려 보고 싶으면 Actions → **Alpha Release** 를 브랜치에서 돌린다.
dist-tag 가 `alpha` 라 `latest` 를 물고 있는 소비처는 영향을 받지 않는다.

## 라이선스

MIT
