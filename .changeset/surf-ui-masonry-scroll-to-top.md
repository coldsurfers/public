---
"@coldsurfers/surf-ui": patch
---

native `Masonry` 의 맨 위로(`scrollToTop`)가 0 에 선다. FlashList `maintainVisibleContentPosition` 을 끈다 — 켜 두면 먼 아래에서 올릴 때 위 카드 높이 보정이 끼어 몇 pt 못 미쳐 멈췄다. React Navigation `useScrollToTop`(탭 다시 누르기)이 이 경로다.
