---
'@coldsurfers/wbe-theme': minor
---

`wbe-tokens` 위에 CSS 변수 · 자체 호스팅 폰트 · vanilla-extract recipe 를 얹은 테마 레인을 발행한다.

소비처가 지는 배선은 둘뿐이다.

```ts
import '@coldsurfers/wbe-theme/fonts'          // 웹폰트 (선택)
import { text, hairline, vars } from '@coldsurfers/wbe-theme'
```

CSS 는 진입점이 물고 온다 — `styles.css` 를 따로 import 하지 않는다. sprinkles 만 무게 때문에
`@coldsurfers/wbe-theme/sprinkles` 로 갈라 뒀다(조합 표를 통째로 들고 있어서, `vars` 한 줄 쓰는
소비처까지 물게 하지 않는다).

**변수 이름은 `wbe-tokens` 의 `tokenVarName` 이 정한다.** VE 해시 이름을 쓰지 않는다 — 소비처가
`var(--wbe-bg)` 를 직접 쓰거나 값을 덮어쓸 수 있어야 하기 때문이다. `:root` 에 43개가 선다.

**캐스케이드는 `@layer wbe-reset, wbe-components` 로 선다.** 파일 순서와 무관하다. sprinkles 는
레이어 밖이라 호출부가 넘긴 유틸이 recipe 를 덮는다 — 유틸이 유틸답게 동작하는 유일한 배선이다.

`@coldsurfers/wbe-tokens` 는 런타임 의존이다. 값은 인라인할 수 있지만 발행되는 `.d.ts` 가
토큰 패키지를 타입으로 물기 때문에, 소비처가 열 수 있는 자리에 있어야 한다.
