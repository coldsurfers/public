---
'@coldsurfers/design-system': minor
---

ConcertCard 에 세로 커버 비율을 열고, `bare` 제목을 시안 활자로 내리고, Popover 가 무관한 스크롤에 닫히던 것을 고친다

**커버 비율 `portrait`(3:4)** — `ConcertCardCoverRatio` 에 값 하나가 붙는다(`landscape` · `square` · `portrait`). 공연 포스터는 세로로 인쇄되는데 기존 두 값은 둘 다 위아래를 잘랐다. 웹 recipe 도 native 도 `CONCERT_CARD_BARE_SPEC.coverAspectRatio` 표를 읽어 자동으로 따라온다.

**`bare` 제목 활자** — `15 / 700 / strong` → **`15 / 500 / text`**, 태블릿 확대(16/23)와 그 짝인 예약 높이(46)를 걷었다. 위계를 굵기가 아니라 명도로 낸다 — 카드 세 줄이 `text` · `muted` · `subtle` 로 이미 세 단이다. **`ConcertCard.Bare` 를 쓰는 모든 지면의 제목이 가벼워진다**(웹 레일·그리드, billets-app 홈 레일). `framed` · `cover` 섀시는 안 건드렸다.

포스터 부재 시 드러나는 대형 이니셜은 **700 을 지킨다** — 전엔 제목 상수를 빌려 쓰고 있었고, 그게 우연히 같은 값이었다. `CONCERT_CARD_BARE_SPEC.initialFontWeight` 로 분리했다.

`ConcertCardSkeleton.Bare` 도 `coverRatio` 를 받는다. 커버 껍데기와 비율 축을 **실카드와 같은 스타일**로 가리키므로 비율이 어긋날 자리가 없다 — 전엔 `landscape` 로 박혀 있어, `portrait` 카드 그리드에 스켈레톤을 깔면 같은 폭에서 커버 높이가 약 1.78배 달라져 로드되는 순간 그리드가 통째로 밀렸다.

**Popover 스크롤 dismiss** — 「메뉴 밖 스크롤이면 전부 닫기」를 **「앵커를 품은 스크롤러만」** 으로 좁혔다. 메뉴는 `fixed` 라 앵커가 움직여야 좌표가 어긋난다. 팝오버 옆에 놓인 가로 칩 줄이 관성으로 굴러가는 중에 트리거를 누르면 열리자마자 닫히던 버그가 사라진다. 페이지 스크롤·앵커를 감싼 패널의 스크롤은 그대로 닫는다.

⚠️ `Record<ConcertCardCoverRatio, …>` 로 비율 축을 전수 매핑하던 소비처는 `portrait` 키를 채워야 한다.
