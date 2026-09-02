---
"@coldsurfers/design-system": minor
---

CSS 를 무는 진입점(`index`·`primitives`·`cards`·`layout`·`motion`·`sprinkles`)이 `styles.css` 를 직접
물고 온다. 소비자는 `import '@coldsurfers/design-system/styles.css'` 를 더 쓰지 않아도 된다.

⚠️ **기존 배선을 지워야 한다.** `./styles.css` export 는 그대로 남지만, 남겨 두면 CSS 가 두 번
실린다 — `cssCodeSplit` 을 켠 소비처에서는 서로 다른 청크로 각각 나가 번들러가 합치지 못한다
(web-next 실측: client CSS 237 kB → 183 kB, 54.5 kB 가 중복이었다).

`native`·`tokens`·`tokens-native`·`style-utils` 는 제외했다: RN 이 CSS 를 물면 Metro 가 깨지고,
값·헬퍼 진입점은 번들러 없이 Node 에서 여는 길을 남긴다.
