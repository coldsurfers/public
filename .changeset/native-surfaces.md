---
'@coldsurfers/design-system': minor
---

RN 표면 둘(`PullToRefresh`·`TabBar`)을 native 레인에 올리고, `Chip` 에 라벨 슬롯을, `ConcertCard` 날짜 줄에 mono 스탬프를 준다.

- `native/PullToRefresh` — 당겨서 새로고침. 기본 `RefreshControl` 은 네이티브 뷰라 커스텀 인디케이터를 못 받아 당김 감지부터 직접 한다. 스크롤러는 소비처가 고르고(`children` 함수), ref 도 소비처가 만들어 넘긴다
- `native/TabBar` — 하단 탭바의 **면만**. 색·테두리·높이(safe-area 포함)·아이템 배치까지고, 라우터 배선과 route→아이콘 매핑은 소비처. 의존은 emotion + safe-area-context 둘뿐이다
- `native/AnimatedTabBar` — 그 면을 **화면 하단에 고정하고 밀어 숨기는 층**. reanimated 는 여기만 문다 — 애니메이션 스타일이 `Animated.*` 에만 먹어서, 면이 위치와 이동을 같이 들면 움직일 일 없는 소비처까지 그 의존을 진다
- 둘 다 웹 짝이 없는 표면이라 `contract/` 를 두지 않는다. 근거는 `docs/native-lane-porting.md` 의 「웹에 짝이 생길 수 없는 표면」
- `Chip.Label` — 아이콘과 라벨을 같이 넣을 때 서식이 소비처로 새지 않게 하는 슬롯. 웹은 표식, RN 은 실제 서식. 조각 사이 `gap` 축이 `CHIP_SPEC` 에 열렸다
- `ConcertCard` 날짜 줄이 sans 13.5/`text` 에서 **mono 11/`muted`** 로 간다. 토큰이 그 자리를 이미 `fontSize['2xs']`("mono 메타")로 이름 붙여 뒀다. 웹 태블릿 확대(15/23)는 같이 걷어냈다 — **웹 레인도 같이 바뀐다**
- RN 생태계 5종(`gesture-handler`·`reanimated`·`safe-area-context`·`svg`·`worklets`)이 **optional** peer 로 열렸다. 웹 소비처는 영향 없다
