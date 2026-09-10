---
'@coldsurfers/design-system': minor
---

`./native` 에 `Skeleton` 을 낸다 — 웹 `primitives/Skeleton` 의 축(`width`·`height`·
`aspectRatio`·`radius`·`tone`)을 RN 으로 옮긴 것.

맥동·톤 알파는 새 `contract/skeleton.ts` 의 `SKELETON_SPEC` 을 두 레인이 읽는다. 웹
`css/motion.css.ts` 의 keyframes 도 이제 그 표에서 duration·easing·최저 불투명도를 가져온다.

맥동은 **RN 코어 `Animated`** 로 낸다 — `react-native-reanimated` 를 peer 로 물지 않는다.
자리표시자 하나를 위해 소비자에게 네이티브 의존을 지우는 값은 안 낸다(`Spinner` 와 같은 판단).
모션 감소 설정이면 맥동을 끄고 한 톤 죽인 정지 상태로 둔다.

치수 축은 **좁혀서** 옮겼다. 웹 `width` 는 임의 CSS 길이를 받지만 RN 은 `DimensionValue`
뿐이고, `aspectRatio` 는 웹이 문자열 RN 이 숫자다 — 같은 표현이 아니라 계약에 올리지 않았다.

`tokens/native` 에 `withAlpha` 가 함께 열린다 — 웹 `alpha()`(`color-mix`)의 RN 짝(`rgba`)이다.
