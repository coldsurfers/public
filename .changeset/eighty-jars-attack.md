---
"@coldsurfers/design-system": minor
---

CSS 를 무는 진입점(`index`·`primitives`·`cards`·`layout`·`motion`·`sprinkles`)이 `styles.css` 를 직접
물고 온다. 소비자는 `import '@coldsurfers/design-system/styles.css'` 를 더 쓰지 않아도 된다.

`./styles.css` export 는 그대로 남는다 — 기존 배선은 계속 동작하고, 중복 import 는 번들러가
합친다. `native`·`tokens`·`tokens-native`·`style-utils` 는 제외했다: RN 이 CSS 를 물면
Metro 가 깨지고, 값·헬퍼 진입점은 번들러 없이 Node 에서 여는 길을 남긴다.
