---
'@coldsurfers/design-system': minor
---

웹 `Text` primitive 를 낸다 — `<Text as textStyle weight color maxLines>`.

앞 판에서 낸 램프(`text()`)가 클래스였다면 이건 **기본값을 가진 자리**다. `<Text>` 하나면 크기 ·
행간 · 자간 · 색이 전부 정해진 채로 선다. 실측이 보여준 문제가 "고를 것이 많아서 안 고른 것"
이었으므로, 고르지 않아도 서게 하는 쪽이 축을 더 늘리는 것보다 낫다.

`as` 는 `textStyle` 과 따로 고른다. 시각적 크기와 문서 구조는 다른 축이고, 묶으면 "제목처럼
보여야 하는 문단"에서 둘 중 하나를 포기하게 된다.

`maxLines` 만 인라인 스타일이다 — N 이 열린 값이라 클래스로 미리 구울 수 없다. 나머지는 전부
`ds-components` 레이어의 클래스라, 호출자가 `className` 으로 얹는 `sprinkles` 유틸이 항상 이긴다.

`TextTone` 이 `native/Text.tsx` 에서 `contract/text-style.ts` 로 올라갔다. 두 레인이 같은 색
축을 쓰게 하려던 것이고, `native/Text` 는 같은 이름을 재수출하므로 **소비자 import 경로는
그대로다.**
