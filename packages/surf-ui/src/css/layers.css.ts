import { globalLayer } from '@vanilla-extract/css'
import { LAYER_ORDER } from './layers'

/**
 * 캐스케이드 순서를 **CSS 로 발행하는 유일한 자리**.
 *
 * `contract.css.ts` 가 이 파일을 부수효과로 끌고 오고, 모든 `.css.ts` 가 contract 를 쓰므로,
 * VE 산출 CSS 의 맨 앞은 언제나 이 순서 선언이다.
 *
 * ⚠️ **왜 앱 진입점의 평범한 CSS 로 하지 않았나 — 시도했다가 실패했다(2026-08-03).**
 * `@layer properties, theme, base, ds-*, …;` 한 줄을 `styles.css` 에 넣었더니 **lightningcss 가
 * minify 하면서 Tailwind 이름 넷을 지워버렸다** (`@layer ds-reset,ds-tokens,ds-components,
 * components,ds-utilities;` 만 남음). 그러면 `base`(Tailwind preflight)가 `ds-components` 뒤로
 * 밀려 컴포넌트의 padding·border 가 전부 지워진다. minifier 를 신뢰할 수 없으니 선언은 VE 로 옮겼다.
 *
 * `globalLayer` 산출이 번들 어디에 실릴지는 여전히 번들러가 정하지만, **이제는 어느 쪽이든 안전하다**:
 *
 *   - VE CSS 가 먼저 실리면 → 이 선언이 전체 순서를 그대로 확정한다(이상적)
 *   - Tailwind CSS 가 먼저 실리면 → `properties·theme·base·utilities` 가 첫 등장으로 자리를 잡고,
 *     이 선언은 남은 `ds-*`·`components` 를 그 뒤에 붙인다. 이때도 **`base` 는 `ds-components`
 *     보다 앞**이므로 preflight 가 컴포넌트를 지우는 사고는 나지 않는다.
 *     (대신 Tailwind `utilities` 가 `ds-components` 보다 앞서므로, 호출자가 넘긴 Tailwind
 *      className 이 컴포넌트를 못 덮는 경우가 생긴다 — 과도기 한정이고 치명적이지 않다.)
 *
 * ⚠️ **위 두 갈래로는 부족했다 — VE 청크끼리의 순서가 남아 있었다(2026-08-04 cockpit 실측).**
 * VE 산출은 *파일 단위*로 귀속되고 이 파일은 공유 모듈이라, 번들러가 어느 한 청크에만 넣는다.
 * cockpit 에선 `shell.css` 로 떨어졌는데 로드 순서는 `layout.css → shell.css` 라, `layout.css` 가
 * 먼저 연 `ds-tokens`·`ds-reset` 이 선언보다 앞서 자리를 잡았다:
 *
 *   의도  properties · theme · base · ds-reset · ds-tokens · ds-components · …
 *   실제  ds-tokens · ds-reset · properties · theme · base · ds-components · …
 *
 * 그래서 **중복 발행**한다. `@layer a,b,c;` 는 이름이 이미 있으면 재정렬하지 않는 no-op 이므로,
 * 여러 청크가 각자 선언해도 **가장 먼저 로드된 청크가 순서를 확정**하고 나머지는 무시된다.
 * 아래 `declareLayerOrder()` 를 앱 진입점이 반드시 물고 오는 `theme.css`·`reset.css` 가 각자
 * 호출한다 — 그 둘의 산출은 언제나 최상위 청크에 실린다.
 *
 * 순서 자체의 정본은 `layers.ts` 의 `LAYER_ORDER`.
 */
export const declareLayerOrder = (): void => {
  for (const name of LAYER_ORDER) {
    globalLayer(name)
  }
}

declareLayerOrder()
