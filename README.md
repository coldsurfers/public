# coldsurfers/public

COLDSURF 이 밖으로 내보내는 패키지들이 사는 곳.

둘이다 — [`@coldsurfers/design-system`](packages/design-system) 과
[`@coldsurfers/markdown-renderer`](packages/markdown-renderer).

> **범용 라이브러리가 아니다.** 오픈소스로 공개하되 COLDSURF 서비스에 정합된 디자인 시스템이다.
> 브랜드 값(accent · paper · cover 톤)이 기본값으로 딸려온다. 목표는 "누구나 쓸 수 있게 범용화" 가
> 아니라 "재활용 가능한 것을 잘 옮기는 것" 이다.

## 패키지

| 패키지 | 무엇 |
| --- | --- |
| [`@coldsurfers/design-system`](packages/design-system) | 토큰 값 · CSS 계약(vanilla-extract) · React primitives · 카드 |
| [`@coldsurfers/markdown-renderer`](packages/markdown-renderer) | 마크다운 → 산문 표면(shiki 하이라이팅 · 미디어 임베드) |

문서 사이트는 [`apps/docs`](apps/docs) 다 — 발행되지 않는 워크스페이스고, 발행되는 `dist` 를
물어서 그린다. 사이트가 빌드된다는 건 `exports` 계약이 살아 있다는 뜻이다.

패키지를 가른 축은 **무게**다. shiki 는 모듈 최상단 부수효과라 번들러가 못 털고, DS 는
CSS 가 한 장이라 안 쓰는 소비자도 지불한다. 그래서 진입점째 갈랐다 — import 안 하면 0 바이트.

## 쓰기

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
pnpm build        # turbo run build (패키지 dist + 문서 out)
pnpm check:type   # turbo run check:type
pnpm check        # biome check .

pnpm --filter @coldsurfers/docs dev   # 문서 사이트
```

Node 22 · pnpm 10.

## 릴리스

패키지를 만진 PR 은 `pnpm changeset` 으로 변경 기록을 남긴다.
main 에 머지되면 Release 워크플로가 version PR 을 열고, 그 PR 이 머지되는 순간 npm 에 발행된다.

## 라이선스

MIT
