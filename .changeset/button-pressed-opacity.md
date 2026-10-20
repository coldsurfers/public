---
"@coldsurfers/surf-ui": minor
---

`Button` · `IconButton` · `TextButton`(웹) 이 누르는 동안 투명도 `BUTTON_SPEC.pressedOpacity`(0.7)로 흐려진다 — 웹 `:active` · RN `activeOpacity` 가 같은 값을 읽고, 웹은 누르는 순간 바로 흐려진다(떼는 쪽만 150ms). RN 은 `TouchableOpacity` 기본값 0.2 에서 0.7 로 덜 사라진다.
