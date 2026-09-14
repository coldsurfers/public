---
'@coldsurfers/design-system': minor
---

`Button` · `IconButton` 에 `danger` variant 를 연다.

색 어휘는 이미 시스템 안에 있었다 — `statusDanger`(`#b8221c`)·`statusDangerBg` 는 토큰에 있고
`Callout` 이 `danger` tone 으로 쓰고 있다. 닿지 못한 건 **버튼뿐**이었다.

그래서 되돌릴 수 없는 액션을 그리려던 지면이 셋 중 하나로 몰렸다 — `accent` 로 칠해 주 액션과
같은 얼굴이 되거나, 플랫폼 대화상자(iOS `destructive`)에 맡기고 표면을 포기하거나, 자기 버튼을
따로 들거나. 세 번째를 막는 게 이 컴포넌트의 일이다.

**축을 늘린 근거.** variant 는 *치수*가 아니라 *색 어휘* 축이라, 늘리는 판정이 `size` 와 다르다
(`size` 는 셋에서 멈춘다 — 시안 높이를 그대로 받으면 목록이 된다). `danger` 는 기존 넷 중
무엇으로도 말할 수 없는 뜻을 하나 더 얹는다: **되돌릴 수 없음.** 강조가 아니다.

hover 는 `accentHover` 같은 짝 토큰이 없어 `primary` 와 같은 방식(투명도 0.9)으로 낸다.
상태 색 하나 때문에 토큰 스케일을 늘리지 않았다. RN 쪽은 원래대로 `TouchableOpacity` 의
누름 투명도가 그 자리를 대신한다.

`IconButton` 도 같이 닫았다 — `Button` 과 **같은 variant 축**을 쓰기로 한 컴포넌트라
한쪽만 열면 같은 이름이 두 컴포넌트에서 다른 범위를 갖는다.

소비자 영향은 더하기뿐이다. 기존 네 값의 표면·라벨색·치수는 그대로고, prop 유니온이 넓어질 뿐이라
지금 쓰는 코드는 바뀌지 않는다. 다만 `ButtonVariant` 를 **exhaustive switch** 로 받는 코드가
있다면 한 갈래를 더 다뤄야 한다.
