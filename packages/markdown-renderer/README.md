# @coldsurfers/markdown-renderer

마크다운 한 덩이를 COLDSURF 산문 표면으로 그린다 — 코드블록 하이라이팅(shiki) · 미디어
임베드(YouTube · Bandcamp · Spotify · OG 카드 · coldsurf.io 이벤트) · 이미지 라이트박스.

## 왜 별도 패키지인가

`@coldsurfers/design-system` 에 얹지 않은 이유는 **무게**다. 둘 다 실측이다.

- **JS** — `MarkdownRenderer` 는 shiki(core + JS regex engine + 언어 9 + 테마 2)를 모듈
  최상단에서 정적으로 물고 `createHighlighterCoreSync()` 를 top-level 로 호출한다. 부수효과라
  번들러가 못 턴다. DS 배럴에 있으면 `<Button>` 하나 쓰는 소비자도 shiki 를 문다.
- **CSS** — DS 는 `cssCodeSplit: false` 라 스타일시트가 **한 장**이고 소비자는 그 한 줄을
  무조건 import 한다. 산문 CSS 470 줄이 거기 합쳐지면 안 쓰는 소비자도 지불한다.

진입점과 스타일시트를 통째로 가르면 **import 안 한 소비자에겐 0 바이트**다.

## 설치

```bash
pnpm add @coldsurfers/markdown-renderer
```

peer 는 넷 — `@coldsurfers/design-system`(색·간격 계약) · `react` · `react-dom` ·
`framer-motion`(라이트박스 전이).

## 쓰기

스타일시트는 **이쪽 것만** 물면 된다. DS CSS 는 이 패키지가 DS 진입점을 물면서 같이 딸려
온다 — 이쪽은 그 변수를 참조하는 산문 규칙만 갖는다.

단 그 주입은 `@coldsurfers/design-system` **0.11 이상**에서만 돈다. peer 범위(`>=0.3.0`)는
그 아래도 허용하므로, 낮은 DS 를 쓰면 `@coldsurfers/design-system/styles.css` 도 같이 문다.

```ts
import '@coldsurfers/markdown-renderer/styles.css'

import { MarkdownRenderer } from '@coldsurfers/markdown-renderer'
;<MarkdownRenderer content={md} />
```

임베드는 **렌더 시점에 네트워크로 가져오지 않는다.** 소비처가 빌드타임에 해소해 prop 으로
밀어 넣는다 — `bandcampEmbeds` · `ogCards` · `coldsurfEvents`.

```ts
<MarkdownRenderer content={md} ogCards={ogCards} coldsurfEvents={events} />
```

KOPIS 출처 데이터가 섞인 이벤트를 임베드하면 출처 표기가 필수다 — 문구는
`KOPIS_COPYRIGHT_TEXT` 로 내보낸다.

## 라이선스

MIT
