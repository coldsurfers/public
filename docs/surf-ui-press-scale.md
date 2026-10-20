# surf-ui 눌림 축소 — 누를 수 있는 것 전부 한 규칙

`PinCard`(#307)의 누르면 줄어드는 손맛을 버튼류 전체로 넓힌다. 투명도 눌림(#303)은 그대로 두고 축소만 더한다.

## 결정

| # | 결정 |
| --- | --- |
| 1 | 값은 `contract/press.ts` 의 `PRESS_SPEC` 하나 — `large` 0.97(카드 · `cta`/`lg` 버튼) · `small` 0.94(그 밖) |
| 2 | 웹은 `style-utils` 의 `pressable(size)` 조각 — 공개 진입점이라 소비처의 손수 만든 버튼도 같은 규칙을 쓴다. CSS `scale` 속성이라 기존 `transform` 과 안 부딪힌다 |
| 3 | native 는 `usePressScale(size)` — `TouchableOpacity` 를 `Animated` 로 감싸 **props 타입이 그대로**다(major 아님) |
| 4 | 동작 줄이기 설정이면 두 레인 다 안 줄인다 |
| 5 | 대상 — 웹: Button · IconButton · Chip · RowAction · ReactionBar · TextButton · PinCard. native: Button · IconButton · Chip · PinCard |
| 6 | `TextButton` 은 `inline` → `inline-block` — 인라인 박스엔 `scale` 이 안 먹는다. 대신 긴 라벨이 줄을 넘겨 접히지 않는다 |

## 순서

- [x] P1 스펙 · `PRESS_SPEC`
- [x] P2 웹 `pressable` + 7개
- [x] P3 native `usePressScale` + 4개
- [x] P4 changeset · docs · 검증 다섯 · 화면 확인
- [x] P5 커밋 · PR(#307 위)
