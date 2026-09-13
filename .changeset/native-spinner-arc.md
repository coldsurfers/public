---
'@coldsurfers/design-system': minor
---

native `Spinner` 가 플랫폼 인디케이터 대신 웹과 같은 **270° 아크 링**을 그린다.

`ActivityIndicator` 를 쓰던 이유는 "로더 하나 때문에 `react-native-svg` 를 소비자에게 지우지
않는다" 였다. 뒤집은 근거는 둘이다 — (1) `PullToRefresh` 가 이미 svg 를 optional peer 로 열었고,
(2) 플랫폼 인디케이터는 **iOS 에서 `size` 숫자가 무시돼**(`UIActivityIndicatorView` 는 두 단계뿐)
시안과 픽셀로 맞출 수가 없었다. 소비처가 자기 로더를 따로 드는 걸 막는 게 이 컴포넌트의 일이다.

치수는 `contract/spinner.ts` 의 `SPINNER_SPEC` 으로 올려 두 구현이 같은 표를 읽는다. 옮기기 전
이미 갈려 있던 두 값이 웹 기준으로 맞춰진다 — 라벨 크기 14 → **13**, 스피너↔라벨 간격 8 → **14**.

prop(`size`·`label`)은 그대로다. native 레인 소비처는 이 표면에서 `react-native-svg` 와
`react-native-reanimated` 를 실제로 물게 된다(둘 다 이미 optional peer).
