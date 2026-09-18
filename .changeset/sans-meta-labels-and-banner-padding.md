---
'@coldsurfers/design-system': minor
---

메타 라벨을 mono 에서 sans 로 옮기고, `PageBanner` 데스크톱 세로 여백을 시안 값으로 맞춘다.

**메타 라벨 mono → sans** (`Eyebrow` · `Badge` solid · `ArticleCard.meta` ·
`ConcertCard.coverEyebrow` · `LeadFeature.byline`)

mono(JetBrains Mono)는 매거진 콜로폰 톤을 노린 선택이었다. 그런데 이 라벨들은 한국어가
절반을 차지한다(`GENRE · 장르`). JetBrains Mono 에 한글이 없어 Latin 만 mono 로 서고 한글은
fallback 으로 떨어져, **한 줄 안에서 두 폰트가 보였다.** 라벨은 본문과 같은 얼굴로 간다.

`ConcertCard` 의 날짜 스탬프(`CONCERT_CARD_BARE_SPEC.metaFontFamily`)는 **mono 로 남긴다.**
그건 라벨이 아니라 수치고, 제목 옆에서 서체가 갈려야 두 줄이 다른 일을 한다는 게 보인다.
자간(`letterSpacing.none`)도 고정폭 전제로 잡혀 있어 같이 움직여야 한다.

sprinkles 의 `fontFamily: 'mono'` 유틸은 그대로다 — 소비자가 쓰는 축이다.

**`PageBanner` 데스크톱 `padding-block` 72 → 88px**

시안 실측값이다(Figma `3363:1188` — 프레임 435 · 첫 요소 y=88 · 마지막 요소 하단 347).
spacing 스케일이 80(`20`) 다음 96(`24`) 이라 88 은 리터럴로 남는다(72 도 그랬다).
소비처는 `SigninBand` 와 `DailyCaptureBand` 둘이고 양쪽 다 두꺼워진다.
