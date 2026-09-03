---
'@coldsurfers/design-system': minor
---

`./tokens.css` 진입점 추가 — `:root` 변수만 담은 한 장(2.5 kB).

`styles.css` 는 `cssCodeSplit: false` 라 리셋·primitives·cards 가 한 장에 다 실린다. Tailwind
나 순수 CSS 로 화면을 짜면서 색·간격만 우리 값으로 맞추려는 앱은 그 전량을 물 이유가 없다.

무레이어 `:root` 다 — 소비 앱이 레이어 순서를 선언하지 않으면 `@layer` 블록은 무레이어 규칙에
항상 진다. 변수 선언은 캐스케이드 다툼의 대상이 아니라 값의 바닥이다.

두 시트를 같이 물어도 안전하다. 같은 이름에 같은 값이다.
