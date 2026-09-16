---
'@coldsurfers/design-system': patch
---

같은 값이 두 곳에 손으로 적혀 갈라지던 자리 셋을 한 표에서 읽게 한다.

- **`bare` 카드 커버의 `aspect-ratio` 가 웹에서 아예 안 먹고 있었다.** VE 가 숫자에 `px` 를
  붙여 `aspect-ratio: 1.333…px` 로 나갔고 브라우저가 선언을 버렸다. `String()` 으로 고친다 —
  빌드도 타입도 못 잡던 자리라 산출 CSS 를 열어보고 찾았다.
- `ConcertCardSkeleton` 이 `CONCERT_CARD_BARE_SPEC` 의 값 여섯을 손으로 다시 적고 있었다.
  spec 을 고치면 실카드만 따라오고 스켈레톤은 남아서, 이 컴포넌트가 막으려던 로드 점프가 났다.
- `Toast` 의 `error` 점이 웹은 `accent`, RN 은 `statusDanger` 로 갈려 있었다. ink pill 위
  대비가 2.95:1 로 비텍스트 하한(3:1)을 못 넘어 RN 쪽이 안 보였다. `accent`(4.25:1)로 통일하고,
  어느 축에서 어느 색을 읽는지를 `contract/toast.ts` 의 표에 적는다.
- 아크 기하 공식이 세 번째로 손으로 적혀 있던 `PullToRefresh` 가 `getSpinnerGeometry` 를
  쓴다. 함수가 굵기·각도를 인자로 받게 열되 기본값은 그대로다 — 픽셀은 안 움직인다.
