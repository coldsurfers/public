# @coldsurfers/design-system

## 1.0.0

### Major Changes

- [#196](https://github.com/coldsurfers/public/pull/196) [`5c28769`](https://github.com/coldsurfers/public/commit/5c28769743c6c192cae7cfe2bed81e6e4e30acf6) Thanks [@yungblud](https://github.com/yungblud)! - 커버 면을 `note` 하나로 접는다 — 공연 카드에서 `tone` 축을 걷어낸다.

  `Skeleton`(API 대기)은 `#eef2f7` 로 밝은데 `CoverBlock`(이미지 대기·부재·실패)은 `cover.steel`
  `#1e2a44` 로 어두웠다. 둘 다 **「아직 그림이 없다」**인데 밝기가 정반대라, 기다림이 두 밝기로
  갈려 화면이 무거웠다. 한 밝기로 접는다.

  ## 깨지는 것

  `ConcertCard` · `ConcertCardSkeleton` · native `ConcertCard` 에서 **`tone` 이 사라진다.**
  공유 계약(`ConcertCardBareProps`)에서도 빠지므로 두 레인이 같이 움직인다.

  ```diff
  - <ConcertCard.Framed tone={coverToneFor(event.id)} initial="ㅅ" … />
  + <ConcertCard.Framed initial="ㅅ" … />

  - <ConcertCardSkeleton.CoverLarge tone="plum" />
  + <ConcertCardSkeleton.CoverLarge />
  ```

  `CoverBlock` 의 `tone` 은 **optional 이 되고 기본이 `note`** 다 — 지향점이 그쪽이라 기본값이
  그쪽이다. 값은 `Skeleton` 이 읽는 `color.surfaceHover` 와 같은 소스다.

  ## 남는 것

  **팔레트 6톤과 `coverToneFor` 는 그대로 산다.** 편집 표지(`ArticleCard`·`LeadFeature`)가
  그걸로 사는 자리이고, 거긴 로딩 면이 아니라 색 다양성이 곧 편집 디자인이다. 걷어낸 건
  **공연 카드의 면 축**뿐이다.

  ## 같이 바뀐 것

  - **면이 글자색도 정한다.** 어두운 6톤 위에선 종이, `note` 위에선 잉크를 `currentColor` 로
    흘린다. 커버 안 대형 이니셜이 톤을 한 번 더 받지 않아도 면을 따라 뒤집힌다.
    이니셜 투명도는 두 섀시가 한 값을 쓴다 — 예전엔 `framed` 만 흰색 85% 라, 면이 밝아지면
    그 값이 잉크 85% 가 되어 워터마크가 아니라 드롭캡이 된다.
  - **`cover` 슬롯이 「포스터 층」으로 좁아진다.** 바닥(`note` 면 + 이니셜)은 언제나 카드가
    그리고, 슬롯은 그 위를 덮는다. 덮을 게 없으면 바닥이 드러난다 — 그래서 `cover` 와
    `initial` 을 **같이** 준다(0.31.0 의 배타 유니온은 풀린다). 활자를 패키지 밖으로 내보내지
    않고도 로드 실패 폴백이 제자리를 찾는다.

  ```tsx
  <ConcertCard.Framed
    initial={title.charAt(0)}
    cover={<PosterImage src={url} />} // 실패하면 아무것도 안 그린다 → 바닥이 드러남
    title={title}
    meta={meta}
  />
  ```

## 0.31.0

### Minor Changes

- [#194](https://github.com/coldsurfers/public/pull/194) [`26dce32`](https://github.com/coldsurfers/public/commit/26dce32c0e7d8129a6a93d753c543735e61e52bb) Thanks [@yungblud](https://github.com/yungblud)! - `ConcertCard` 에 `cover` 슬롯을 연다 — 커버를 채우는 것을 소비처가 정할 수 있다.

  로드 실패 폴백처럼 **상태가 필요한 커버**가 들어갈 자리가 없었다. `cards` 는 훅도 `'use client'`
  도 없는 서버 안전 모듈이라 그 상태를 패키지 안에서 들 수 없다 — 들면 엔트리가 통째로 클라이언트
  전용이 되고, `primitives` 배럴이 `Toast` 로 겪은 RSC 사고를 반복한다. 그래서 자리만 카드가 정하고
  내용물은 소비처가 준다(`coverAction` 과 같은 규율).

  같이 정리한 것: **「포스터가 있는가」를 읽는 자리를 하나로 모았다.** 세 섀시가 같은 질문에 다르게
  답하고 있었다 — `framed` 는 `CoverImage` 밖에서 한 번 더 읽었고(`posterUrl ? null : initial`),
  `bare` 는 바깥 삼항이 먼저 갈라서 `CoverImage` 의 빈 갈래가 죽은 코드였다. `CoverImage` 를
  `CoverFill(src, fallback)` 로 바꿔 판정 주인을 하나로 뒀다(무상태 유지).

  정확한 문(`ConcertCard.Framed`·`.Bare`·`.Cover*`)에선 커버 축이 **유니온**이다 — `cover` 를
  주면 `posterUrl`·`initial` 이 타입에서 닫힌다. 합집합으로 두면 슬롯을 쓰는 소비처가 아무 데도
  안 그려질 자모 한 글자를 여전히 지어내야 했다(이 파일이 `variant="cover"` 에 대해 고발하던
  그 병). 덤으로 `cover` 와 `posterUrl` 을 같이 줬을 때 누가 이기는지 외울 일도 없어진다.

  기존 `posterUrl`·`initial` 은 그대로 산다 — `cover` 를 안 주면 동작도 타입도 같다.

  ```tsx
  // 그대로 (변화 없음)
  <ConcertCard.CoverCompact tone={tone} posterUrl={url} title={…} meta={…} />

  // 상태가 필요한 커버 — 소비처가 꽂는다
  <ConcertCard.CoverCompact tone={tone} cover={<PosterImage src={url} />} title={…} meta={…} />
  ```

  ⚠️ `cover` 는 웹 `ConcertCardProps` 에만 있다. 공유 계약(`ConcertCardBareProps`)에 올리면 native
  가 안 그리는 prop 이 하나 더 생긴다 — `initial`·`footer` 가 이미 앓은 「있는데 안 먹는 prop」이다.

## 0.30.0

### Minor Changes

- [#192](https://github.com/coldsurfers/public/pull/192) [`5af1f9a`](https://github.com/coldsurfers/public/commit/5af1f9ac7c3fdcff6eb6189288e74d09d8a7a937) Thanks [@yungblud](https://github.com/yungblud)! - `ConcertCardSkeleton` 에 실카드와 **1:1 짝인 문 다섯**을 낸다 — `.Framed` · `.Bare` · `.Cover` ·
  `.CoverCompact` · `.CoverLarge`. 커버 쪽은 `size` 축(`ConcertCardSize`)도 함께 받는다.

  축을 플래그로 넘기던 동안엔 짝을 **소비처가 기억해야** 했다. 카드만 `size="large"` 로 바꾸고
  스켈레톤을 `framed` 에 두면 타입은 통과하고 화면이 로드 순간에 280 → 460 으로 튄다. 실제로 그
  일이 났다. 문 이름이 짝을 말하면 그 사고가 성립하지 않는다.

  커버 스켈레톤이 치수를 **옮겨 적지 않고 실카드의 `coverCover` recipe 를 그대로 가리킨다.** 원래
  430/500 을 손으로 적어 둬서, 실카드에 크기가 둘 더 붙는 동안 스켈레톤만 `full` 에 남아 있었다.
  이제 크기가 또 붙어도 자동으로 따라온다.

  `variant`·`size`·`reserveTitleLines` prop 은 그대로 산다. 기존 소비처는 안 깨진다.

## 0.29.0

### Minor Changes

- [#190](https://github.com/coldsurfers/public/pull/190) [`be8e9b9`](https://github.com/coldsurfers/public/commit/be8e9b925367c044024283dd4a5d8d255cf95d49) Thanks [@yungblud](https://github.com/yungblud)! - `ConcertCard` 의 커버 섀시에 크기 하나를 더 낸다 — `ConcertCard.CoverLarge`(= `size="large"`,
  420/460 · 여백 24). `CoverCompact` 와 **같은 그림**이고 치수만 다르다.

  여는 자리는 **여러 열 그리드**다. 칸이 420px 폭쯤 되면 `CoverCompact` 높이(300)로는 칸이 가로로
  누워 세로 포스터의 상하단이 크게 잘린다. 레일처럼 칸이 좁은 자리는 `CoverCompact` 가 맞다.

  문이 다섯인데 섀시는 여전히 셋이다. `CoverCompact` 와 `CoverLarge` 사이는 슬롯이 같아 진짜
  크기 축이라 플래그로 둬도 거짓말을 안 하지만, 그러면 커버 문만 플래그를 되받아 규율이 반쪽이
  된다 — 소비처가 「커버는 문으로 고른다」 하나만 외우면 되게 둔다.

  `CoverLargeConcertCardProps` 도 `cards` 진입점에서 함께 나간다(`CoverCompact` 쪽 별칭).
  기존 `full`·`compact` 의 렌더 결과는 바뀌지 않는다.

## 0.28.0

### Minor Changes

- [#188](https://github.com/coldsurfers/public/pull/188) [`ce4f9e2`](https://github.com/coldsurfers/public/commit/ce4f9e237ed4ab22cb6c7f035c2921dabd3d24bd) Thanks [@yungblud](https://github.com/yungblud)! - `ConcertCard` 의 `cover` 섀시에 크기 축(`size`) 추가 — `full`(기본, 현행) · `compact`.
  그리고 섀시들을 정적 프로퍼티로 냈다 — `ConcertCard.Framed` · `ConcertCard.Bare` ·
  `ConcertCard.Cover` · `ConcertCard.CoverCompact`.

  `compact` 는 날짜 · 제목 · 공연장 셋을 다 커버 안 하단에 넣고 스크림을 카드 전체 높이에 건다.
  작은 칸(랜딩 · 그리드)에서 커버 밖에 메타 한 줄을 더 두면 카드가 두 덩어리로 갈라져 보인다.

  정적 프로퍼티는 평평한 `ConcertCardProps` 가 세 섀시의 축을 합집합으로 들고 있는 걸 푼다.
  `cover` 에 `matchLabel` 을 줘도 타입이 통과했고, 반대로 `initial` 은 그 섀시가 아무 데도 안
  그리는데 **필수**라 소비처가 안 쓰일 자모를 지어내야 했다. 섀시별 문으로 들어오면 `Pick` 이
  소비처까지 닿는다 — 네 props 타입(`FramedConcertCardProps` · `BareConcertCardProps` ·
  `CoverConcertCardProps` · `CoverCompactConcertCardProps`)도 `cards` 진입점에서 같이 나간다.

  **문은 넷인데 섀시는 셋이다.** 커버만 크기로 갈라 냈다 — `size` 는 크기 플래그처럼 생겼지만
  `compact` 에서만 `footer` 가 그려지는 **슬롯 축**이라, 한 문에 플래그로 두면 `full` 쪽 `footer`
  가 `initial` 과 같은 병(있는데 안 먹는 prop)에 걸린다. 크기를 문 이름에 박으면 플래그가 바깥에서
  사라져 그 병이 성립하지 않는다 — `ConcertCard.Cover` 에 `footer` 를 넘기면 컴파일 에러다.

  `variant` 는 그대로다 — 새 축은 `cover` 섀시 안의 prop 이고 정적 프로퍼티는 옆에 문을 더 단
  것이라 문 이름이 안 바뀐다. `ConcertCardProps.size` 도 남는다. 두 체계가 공존한다: `variant`
  문은 관대하고(합집합·조용한 무시) 정적 프로퍼티 문은 정확하다(그 섀시가 그리는 것만).
  기본값이 `full` 이라 기존 `cover` 소비처의 렌더 결과는 그대로다.

## 0.27.0

### Minor Changes

- [#186](https://github.com/coldsurfers/public/pull/186) [`1a07f20`](https://github.com/coldsurfers/public/commit/1a07f209b15ed324f6ce5dcf8f30effd3f24a49b) Thanks [@yungblud](https://github.com/yungblud)! - `Note` 프리미티브 · `fontFamily.geist` 추가

  **`Note`** — 메타 한 줄 + 헤드라인 한 줄. 메타 10/11px ↔ 헤드라인 14/15px, 무게는 둘 다 500 하나. 위계를 크기가 아니라 여백과 순서로 만드는 규율의 압축형이다.

  값은 `apps/im-coldsurf` 랜딩의 `NotePanel` **그대로**다. 그 표면이 이 톤의 정본이고 나머지가 그쪽으로 옮겨 가는 중이라 정본이 픽셀 하나도 움직이면 안 된다 — 브레이크포인트도 정본의 축(`desktop` 1024)을 따른다(정본이 "태블릿 시안이 없으므로 중간 단을 만들지 않는다"고 못박아 뒀다).

  **`fontFamily.geist`** — 앱 셋(`im-coldsurf` · `web-next` · `beam-web`)이 같은 문자열을 각자 들고 있었다. 앞의 둘은 `theme.css.ts` 의 같은 줄 번호까지 같다. 원색층(`--cs-*`)을 올린 것과 같은 근거다. `sans` 와 역할이 갈린다 — 저쪽이 읽는 글이고 이쪽은 세는 글(수치·워드마크·메타).

  추가만이라 기존 API 는 그대로다. 근거: coldsurfers/paul-rockstar#452 Phase 3.

## 0.26.0

### Minor Changes

- [#184](https://github.com/coldsurfers/public/pull/184) [`db15673`](https://github.com/coldsurfers/public/commit/db156733e54f4f291375e4e4fab437069a2a2e18) Thanks [@yungblud](https://github.com/yungblud)! - 인디케이터 3색 · 아티스트 노드 톤 8색 · 인쇄 스킴 추가

  세 자리 모두 소비 앱(`apps/web-next`)이 리터럴로 들고 있던 값이다. 원색층이 세운 원칙("앱이 각자 파던 층을 DS 가 진다") 그대로 올린다.

  **① `palette` 에 인디케이터 셋** — `lagoon`(시안) · `pine`(틸그린) · `iris`(바이올렛). 레일·상태 색점용 **채도 있는** 색이다. `cover` 6톤을 못 쓰는 이유는 면적 — 그쪽은 색면용 어두운 톤이라 8px 점으로 줄이면 전부 같은 검정으로 뭉친다. 넷 중 첫 자리는 `surfBlue` 가 겸하므로 셋만 는다.

  **② `nodeTone` 8색 + `NODE_TONES` · `nodeToneFor`** — taste engine 노드가 이름 해시로 고르는 색면. `cover` 와 별개 축인 이유 셋: 중성 다크 셋을 포함하고(노드가 여럿 붙는 화면이라 전부 틴트면 알록달록해진다), 목적이 *여덟이 서로 갈리는 것*이라 6으로 못 줄이며, `cover` 는 이벤트 표지 축이다. `coverToneFor` 와 **해시가 다르다** — 원본 구현을 그대로 옮겼고, 바꾸면 이미 노출된 화면의 색 배치가 통째로 달라진다.

  **③ `printThemeVars`** — 종이 위의 `ColorScheme`. 화면 스킴에서 파생되지 않는다(`bg` #f5f7fa 를 그대로 인쇄하면 잉크만 먹는다). ⚠️ **DS 는 전역으로 발행하지 않는다** — `@media print` 를 `theme.css.ts` 에 넣으면 인쇄를 안 쓰는 소비 앱의 인쇄까지 바뀐다. 값만 내고 주입은 필요한 앱이 한다.

  이름이 하나도 안 없어지므로 minor 다.

## 0.25.0

### Minor Changes

- [`397ab8c`](https://github.com/coldsurfers/public/commit/397ab8cf557dfa53cbe37b771cd0f08c547ed3be) Thanks [@yungblud](https://github.com/yungblud)! - 원색층 `--cs-*` 추가 · `ink` RN 노출 수정 · shadow/gradient 축 신설

  **의미이름(`--bg`·`--text`·…)은 하나도 바뀌지 않았다.** 값도 전부 그대로다 — 소비처 수정이 필요 없다.

  - **`palette` 그룹 신설** — COLDSURF 원색 19색을 `--cs-*` 로 발행한다(`--cs-deep-night` 등).
    `light` 와 `ink` 가 이제 전부 여기서 파생하므로 hex 정본이 한 군데다.
    역할 이름이 안 붙는 자리(그라디언트 정지색·타일 바닥·내비 글자)의 탈출구이고,
    **의미이름이 있는 자리에 쓰는 것이 아니다.** 설계 근거는 `docs/palette-layer.md`.
  - **`ink` 배선 수정** — `tokens` 집계 객체에 빠져 있어 `tokens/native.ts` 에 안 실렸다.
    그래서 **RN 이 다크 밴드 색 넷을 읽을 수 없었다.** 값 추가 없이 배선만 고쳤고,
    `native.ts` 가 `ink` 와 `palette` 를 재수출한다.
  - **`shadow` 그룹 신설** — `Popover`·`Modal`·`Toast` 가 각자 들고 있던 boxShadow 리터럴 셋을
    깊이 축 하나로 접고 `shadow.accent` 를 더했다. **값은 정규화하지 않았다**(시각 회귀 0).
    `Checkbox` 의 포커스 링은 깊이가 아니라 포커스 축이라 그대로 뒀다.
  - **`gradient` 그룹 신설** — 표면 그라디언트 6종. 데이터로 정해지는 `cover` 와 다른 축이다.
  - **`radius` 에 `2xl`(16px)·`3xl`(24px)** — 천장이 12px 이라 큰 카드·패널이 리터럴로 새고 있었다.
    눈금이 이어지는 둘만 넣었다. 반응형 짝(14→16·20→24·24→28)은 합성 슬롯이라 P3 으로 넘긴다.

  `@coldsurfers/tailwind4-theme` 는 그룹을 명시적으로 호출하므로 새 그룹이 자동 노출되지 않는다 —
  Tailwind 에 뚫을지는 별도 결정이다.

## 0.24.0

### Minor Changes

- [#181](https://github.com/coldsurfers/public/pull/181) [`8afaae0`](https://github.com/coldsurfers/public/commit/8afaae090b4190a783fc9b4636a8ba486376e4fb) Thanks [@yungblud](https://github.com/yungblud)! - 메타 라벨을 mono 에서 sans 로 옮기고, `PageBanner` 데스크톱 세로 여백을 시안 값으로 맞춘다.

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

## 0.23.0

### Minor Changes

- [#179](https://github.com/coldsurfers/public/pull/179) [`be32c77`](https://github.com/coldsurfers/public/commit/be32c776d6403a26e3f24c10eebbb0e25e3955a0) Thanks [@yungblud](https://github.com/yungblud)! - `Button variant="outline"` 의 바탕을 `white` 리터럴에서 `surface` 토큰으로 옮긴다.

  라이트 스킴에서 `surface` 는 `#ffffff` 라 **기존 표면의 시각 변화는 없다.** 달라지는 건
  스킴을 스코프로 뒤집은 서브트리다 — 라이트 페이지 안에서 한 구간만 어둡게 눕는 잉크 밴드
  (랜딩 헤더·히어로)에서 outline 버튼이 흰 알약으로 남고, `label: 'text'` 는 제대로 뒤집혀
  흰 글자가 되어 **흰 바탕에 흰 글자**가 됐다.

  `white` 리터럴은 `accent`·`danger` 의 *라벨*에만 남는다. 그 둘은 자기 바탕을 리터럴로 깔고
  앉으므로 글자도 같이 고정되는 게 맞다. 계약이 웹·네이티브 공용이라 RN `Button` 도 같이 따른다.

## 0.22.0

### Minor Changes

- [#177](https://github.com/coldsurfers/public/pull/177) [`c1ddc59`](https://github.com/coldsurfers/public/commit/c1ddc59413fd2982719be285fed1139dd4577e0c) Thanks [@yungblud](https://github.com/yungblud)! - 브랜드 색을 warm-paper 에서 **쿨 계열로 확정한다.** 액센트가 blood orange `#d6451f` 에서
  surf blue `#2563ff` 로 바뀌는 것이 이 변경의 축이고, 나머지 색은 그 축에 맞춰 따라간다.

  근거는 Figma Page 16 시안 셋(입장권 14화면 · Persona Landing 데스크톱/모바일 · 이벤트 상세)이다.
  warm 계열 회갈색과 쿨 계열 표면이 한 화면에서 같이 서지 않았다 — 특히 `cover` 팔레트의
  초록·황토·와인이 유일한 warm 잔재로 남아 튀었다.

  **대비는 깨지 않는다.** `muted` 는 읽는 글자의 하한선이라는 규율(coldsurfers/public#106)을
  그대로 두고 값만 옮겼다 — surface 위 5.6:1 → **5.98:1** 로 올라간다. `accent` 도 4.3:1 →
  **4.88:1** 로 올라 본문 크기에서 AA 를 넘는다. `subtle` 은 2.34:1 → 2.54:1 로 여전히
  _읽히지 않아도 되는 것_ 전용이다.

  **`cover` 키 이름은 바꾸지 않았다.** `forest` 에 틸, `moss` 에 인디고가 들어가 이름이 값을
  설명하지 못하게 되지만, `coverToneFor` 가 `Object.keys(cover)` **순서**로 결정적 분산을 하므로
  키를 건드리면 이미 발행된 모든 이벤트의 커버색이 재배치된다. 이름은 색이 아니라 슬롯이고,
  그 사실을 주석에 적었다.

  `paper.warm` 도 같은 이유로 키를 유지한다(값은 `#fafaf7` → `#f9fbfd`). 브랜드 정본 paper
  (`light.bg`)와 **다른 값**이라는 이름 사전의 규칙은 그대로다 — 둘은 여전히 구별 대상이다.

  ### `ink` 스케일 신설

  라이트 표면 안에서 **한 구간만 눕는 다크 밴드**(헤더·히어로·캡처 밴드)가 쓰는 색 넷을
  `cover`·`paper` 와 같은 성격의 스킴 불변 scale 로 낸다 — `--ink-base` · `--ink-surface` ·
  `--ink-border` · `--ink-accent`.

  ink(dark) **스킴**을 되살리는 것이 아니다. 전역으로 색을 뒤집는 축은 여전히 없고
  (paul-rockstar [#299](https://github.com/coldsurfers/public/issues/299) 는 그대로), 그 구간이 쓰는 상수만 시스템 안으로 들인다. 지금은 소비처가
  같은 hex 를 자기 파일에 적고 있다.

  `ink.base` 는 `light.text` 와, `ink.border` 는 `light.body` 와 같은 hex 다. 이름이 겹치는 게
  아니라 **역할이 둘인 값**이라 양쪽에 둔다.

## 0.21.0

### Minor Changes

- [#162](https://github.com/coldsurfers/public/pull/162) [`7dd2cde`](https://github.com/coldsurfers/public/commit/7dd2cdec3d822462b5e681cfd7d96afc2800cf8a) Thanks [@yungblud](https://github.com/yungblud)! - `cards/*` 넷과 로더 넷이 DOM props 를 받는다 — `id` · `data-*` · `aria-*` · `style` ·
  `onMouseEnter` 등.

  `primitives/*` 와 `layout/*` 는 예외 없이 `HTMLAttributes` 를 extends 하고 rest 를 펴는데
  `cards` 진입점만 `className` 하나로 닫혀 있었다. 소비처가 테스트 훅이나 `id` 를 붙이려면
  카드를 한 겹 더 감싸야 했다.

  `ConcertCard` 만 DOM `title`(툴팁)을 받지 않는다 — 카드가 그 이름을 이미 제목 문자열로 쓴다.

  native `Spinner` 도 `ViewProps` 를 받는다. 같은 레인의 `Skeleton`·`Text`·`Chip`·`Button` 은
  이미 받고 있었고 이 하나만 `style` 조차 못 받았다.

- [#166](https://github.com/coldsurfers/public/pull/166) [`1da2363`](https://github.com/coldsurfers/public/commit/1da236355c5fcead95934dc5704292b38b4c8520) Thanks [@yungblud](https://github.com/yungblud)! - 웹 레인의 축 타입을 소비처가 이름으로 부를 수 있게 낸다 — native 레인이 이미 하던 것이다.

  `./primitives` 는 `ButtonSize` · `ButtonVariant` · `ChipSize` · `TextTone` · `TextStyleName` 을,
  `./cards` 는 `ConcertCardVariant` · `ConcertCardCoverRatio` 를, `./native` 는 `TextStyleName` 을
  추가로 내보낸다. `Props['variant']` 로 짚을 수는 있었지만 `Record<…>` · `useState<…>` 자리에선
  이름이 필요해서, 소비처가 유니온을 자기 쪽에 다시 적게 되는 경로였다.

  덤으로 웹 `Chip` 이 `'sm' | 'md'` 를 직접 적던 것을 계약의 `ChipSize` 로 바꾼다.

### Patch Changes

- [#160](https://github.com/coldsurfers/public/pull/160) [`488a4e0`](https://github.com/coldsurfers/public/commit/488a4e04029523aab65fb120397ad0a09c3497bb) Thanks [@yungblud](https://github.com/yungblud)! - 접근성 비대칭 세 곳을 고친다 — 전부 타입이 통과하던 자리다.

  - `native/Modal` 의 필수 `label` 이 아무 데도 안 붙고 있었다. RN 의 `Modal` 은 props 를
    네이티브 뷰로 명시 목록만 넘기고 `accessibilityLabel` 은 그 목록에 없다. 다이얼로그 이름을
    실제 표면인 패널이 들게 옮기고, 웹과 같은 prop 이름 셋(`role`·`aria-modal`·`aria-label`)을 쓴다.
  - 웹 `Chip` 의 `active` 가 스크린 리더에 안 읽혔다. 색으로만 갈렸다. 토글로 쓰는 칩
    (`active` 를 넘긴 자리)에만 `aria-pressed` 를 붙인다 — RN 짝은 이미 하고 있던 일이다.
  - `native/Spinner` 가 `label` 없이 쓰이면 이름 없는 `progressbar` 였다. 웹이 이미 들고 있던
    폴백을 `SPINNER_SPEC.fallbackLabel` 로 올려 두 레인이 같은 문구를 말한다.

- [#157](https://github.com/coldsurfers/public/pull/157) [`a8d689d`](https://github.com/coldsurfers/public/commit/a8d689d22139cd000a88cc969688ab408407c4d1) Thanks [@yungblud](https://github.com/yungblud)! - `Button` 의 치수·variant 색 표를 `contract/button.ts` 의 `BUTTON_SPEC` 으로 모은다.

  웹 recipe(`Button.css.ts`)와 RN 구현에 같은 값이 두 벌 적혀 있었고 담보가 주석 한 줄이었다.
  이제 양쪽이 한 표를 각자의 토큰 맵으로 읽는다. 산출 CSS 는 바이트 단위로 동일하다.

  RN 두 구현이 같이 쓰는 표면 계산은 `native/button-style.ts` 로 뺀다 — 진입점이 아닌 모듈이라
  `exports` 맵에 오르지 않고, `native/IconButton` 이 `native/Button` 을 통째로 물지도 않는다.
  공개 API 는 그대로다.

- [#161](https://github.com/coldsurfers/public/pull/161) [`f3ef29f`](https://github.com/coldsurfers/public/commit/f3ef29f7ece9a857b5b2aac4be096d73c8500e56) Thanks [@yungblud](https://github.com/yungblud)! - 같은 값이 두 곳에 손으로 적혀 갈라지던 자리 셋을 한 표에서 읽게 한다.

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

- [#156](https://github.com/coldsurfers/public/pull/156) [`3a2f619`](https://github.com/coldsurfers/public/commit/3a2f619024b13f9271409105fa79e4957e1ebd30) Thanks [@yungblud](https://github.com/yungblud)! - `native/Button` · `native/IconButton` 의 비활성 투명도가 소비자 `style` 에 덮여 사라지던 것을 고친다.

  투명도를 `style` prop 으로 얹고 있어서 `<Button style={{ marginTop: 8 }} disabled />` 처럼
  `style` 을 넘기면 그 한 겹이 통째로 덮였다 — 비활성 버튼이 활성과 똑같이 보였다.
  컴포넌트 기본 스타일로 옮겨서 소비자 `style` 이 이기는 것도 덮는 것도 명시적 선택이 되게 한다.

- [#154](https://github.com/coldsurfers/public/pull/154) [`062b4d2`](https://github.com/coldsurfers/public/commit/062b4d2908854f382da6f2c71798ca234f625a2f) Thanks [@yungblud](https://github.com/yungblud)! - `ConcertCard` 의 섀시 셋을 `FramedCard`·`BareCard`·`CoverCard` 세 컴포넌트로 분해. `variant` prop 과 `ConcertCardProps` 는 그대로라 공개 표면은 동일하다(`dist/cards.d.ts` 동일). 커버 안 `space-between` 을 채우려고 넣었던 빈 `<span />` 셋은 `margin: auto` 로 대체 — 슬롯 하나가 비면 남은 하나가 제자리를 잃던 자리다.

## 0.20.0

### Minor Changes

- [#138](https://github.com/coldsurfers/public/pull/138) [`587433b`](https://github.com/coldsurfers/public/commit/587433b81638c2511a0f7a0f31bca44ceac92c12) Thanks [@yungblud](https://github.com/yungblud)! - `Button` · `IconButton` 에 `danger` variant 를 연다.

  색 어휘는 이미 시스템 안에 있었다 — `statusDanger`(`#b8221c`)·`statusDangerBg` 는 토큰에 있고
  `Callout` 이 `danger` tone 으로 쓰고 있다. 닿지 못한 건 **버튼뿐**이었다.

  그래서 되돌릴 수 없는 액션을 그리려던 지면이 셋 중 하나로 몰렸다 — `accent` 로 칠해 주 액션과
  같은 얼굴이 되거나, 플랫폼 대화상자(iOS `destructive`)에 맡기고 표면을 포기하거나, 자기 버튼을
  따로 들거나. 세 번째를 막는 게 이 컴포넌트의 일이다.

  **축을 늘린 근거.** variant 는 *치수*가 아니라 _색 어휘_ 축이라, 늘리는 판정이 `size` 와 다르다
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

## 0.19.0

### Minor Changes

- [#130](https://github.com/coldsurfers/public/pull/130) [`4988cf1`](https://github.com/coldsurfers/public/commit/4988cf1b94de94d503aac0e1d4ec344acd37bb42) Thanks [@yungblud](https://github.com/yungblud)! - native `Spinner` 가 플랫폼 인디케이터 대신 웹과 같은 **270° 아크 링**을 그린다.

  `ActivityIndicator` 를 쓰던 이유는 "로더 하나 때문에 `react-native-svg` 를 소비자에게 지우지
  않는다" 였다. 뒤집은 근거는 둘이다 — (1) `PullToRefresh` 가 이미 svg 를 optional peer 로 열었고,
  (2) 플랫폼 인디케이터는 **iOS 에서 `size` 숫자가 무시돼**(`UIActivityIndicatorView` 는 두 단계뿐)
  시안과 픽셀로 맞출 수가 없었다. 소비처가 자기 로더를 따로 드는 걸 막는 게 이 컴포넌트의 일이다.

  치수는 `contract/spinner.ts` 의 `SPINNER_SPEC` 으로 올려 두 구현이 같은 표를 읽는다. 옮기기 전
  이미 갈려 있던 두 값이 웹 기준으로 맞춰진다 — 라벨 크기 14 → **13**, 스피너↔라벨 간격 8 → **14**.

  prop(`size`·`label`)은 그대로다. native 레인 소비처는 이 표면에서 `react-native-svg` 와
  `react-native-reanimated` 를 실제로 물게 된다(둘 다 이미 optional peer).

## 0.18.0

### Minor Changes

- [#118](https://github.com/coldsurfers/public/pull/118) [`c7a340a`](https://github.com/coldsurfers/public/commit/c7a340a91209b7034e4a3f98d2fdcd422a781368) Thanks [@yungblud](https://github.com/yungblud)! - `PullToRefresh` 에 `onHapticFeedback` 을 연다 — 새로고침이 끝나 틈이 닫히기 시작하는 순간 한 번 불린다.

  haptic 을 DS 가 직접 울리지 않는 건 계약 때문이다. `expo-haptics` 를 물면 Expo 를 쓰지 않는 소비처까지
  그걸 깔아야 한다. 무엇을 어떤 세기로 울릴지도 화면의 맥락이라 소비처가 정한다. 선택 prop 이라 기존 소비처는 그대로다.

## 0.17.1

### Patch Changes

- [#116](https://github.com/coldsurfers/public/pull/116) [`4fdb7b8`](https://github.com/coldsurfers/public/commit/4fdb7b8e91ee2173e0632816bb4d216480e71bc5) Thanks [@yungblud](https://github.com/yungblud)! - RN 워클릿이 소비 앱에서 워클릿화되지 않던 것을 고친다.

  `react-native-worklets/plugin` 은 워클릿화할 콜백을 **호출부의 로컬 식별자 이름**으로 고르는데(`callee.name` → `reanimatedFunctionHooks.has(name)`), 라이브러리 빌드가 `useAnimatedStyle` 을 `c` 로 줄이면서 그 목록에 안 걸렸다. 콜백은 워클릿이 아닌 채 남고, 소비 앱 런타임에서 `[Worklets] Tried to synchronously call a Remote Function. Called "anonymous" on the UI Runtime` 로 터진다(실측: billets-app, 0.17.0).

  - `build.minify: false` — 라이브러리가 minify 를 지는 건 원래도 소비자 몫을 뺏는 일이다. Metro·Hermes 가 앱 빌드에서 다시 줄인다. `cssMinify` 는 켜 둬서 `styles.css` 크기는 그대로다
  - `PullToRefresh` · `PullToRefreshSpinner` · `AnimatedTabBar` 의 워클릿 콜백 8곳에 `'worklet'` 지시어를 직접 적었다 — 지시어는 이름과 무관하게 걸려서 번들 설정에 안 걸린다

  타입도 `check:exports` 도 못 잡는 종류라, 원인(minify)과 재발(지시어) 둘 다 막는다.

## 0.17.0

### Minor Changes

- [#114](https://github.com/coldsurfers/public/pull/114) [`05813e0`](https://github.com/coldsurfers/public/commit/05813e0c53257bc6b70b50c44824be02519ed27f) Thanks [@yungblud](https://github.com/yungblud)! - RN 표면 둘(`PullToRefresh`·`TabBar`)을 native 레인에 올리고, `Chip` 에 라벨 슬롯을, `ConcertCard` 날짜 줄에 mono 스탬프를 준다.

  - `native/PullToRefresh` — 당겨서 새로고침. 기본 `RefreshControl` 은 네이티브 뷰라 커스텀 인디케이터를 못 받아 당김 감지부터 직접 한다. 스크롤러는 소비처가 고르고(`children` 함수), ref 도 소비처가 만들어 넘긴다
  - `native/TabBar` — 하단 탭바의 **면만**. 색·테두리·높이(safe-area 포함)·아이템 배치까지고, 라우터 배선과 route→아이콘 매핑은 소비처. 의존은 emotion + safe-area-context 둘뿐이다
  - `native/AnimatedTabBar` — 그 면을 **화면 하단에 고정하고 밀어 숨기는 층**. reanimated 는 여기만 문다 — 애니메이션 스타일이 `Animated.*` 에만 먹어서, 면이 위치와 이동을 같이 들면 움직일 일 없는 소비처까지 그 의존을 진다
  - 둘 다 웹 짝이 없는 표면이라 `contract/` 를 두지 않는다. 근거는 `docs/native-lane-porting.md` 의 「웹에 짝이 생길 수 없는 표면」
  - `Chip.Label` — 아이콘과 라벨을 같이 넣을 때 서식이 소비처로 새지 않게 하는 슬롯. 웹은 표식, RN 은 실제 서식. 조각 사이 `gap` 축이 `CHIP_SPEC` 에 열렸다
  - `ConcertCard` 날짜 줄이 sans 13.5/`text` 에서 **mono 11/`muted`** 로 간다. 토큰이 그 자리를 이미 `fontSize['2xs']`("mono 메타")로 이름 붙여 뒀다. 웹 태블릿 확대(15/23)는 같이 걷어냈다 — **웹 레인도 같이 바뀐다**
  - RN 생태계 5종(`gesture-handler`·`reanimated`·`safe-area-context`·`svg`·`worklets`)이 **optional** peer 로 열렸다. 웹 소비처는 영향 없다

## 0.16.0

### Minor Changes

- [#107](https://github.com/coldsurfers/public/pull/107) [`f268687`](https://github.com/coldsurfers/public/commit/f268687c1c8818d83f011fe162a6f7310d6384f2) Thanks [@yungblud](https://github.com/yungblud)! - 본문·UI 자간 축을 토큰으로 낸다 — `letterSpacing` 3단계(`none` · `normal` · `tight`)와
  `--letter-spacing-*` 변수, `sprinkles({ letterSpacing })`.

  지금까지 `editorialType` 3그룹(eyebrow · display · caption)만 `letterSpacing` 을 갖고 있어서
  본문·UI 는 브라우저 기본값(0)이었다. Pretendard 로 한글을 0 에 두면 같은 크기에서 라틴보다
  헐렁하게 읽혀, 소비처가 자기 CSS 로 이 자리를 메우고 있었다. 반응형 축으로는 열지 않았다 —
  자간은 폭이 바뀌어도 같이 움직일 이유가 없다.

  `editorialType` 의 자간과는 겹치지 않는다. 저쪽은 크기까지 묶은 합성 슬롯이고 이쪽은 어느
  크기에든 얹는 단일 속성이라, 합성 슬롯을 쓰는 자리에선 이 토큰을 덧대지 않는다.

  `color.subtle` 은 값이 그대로다. 다만 **읽는 글자에 쓸 수 없다**는 경계를 토큰 주석과
  `foundations/colors` 에 적었다 — 실측이 `surface` 위 2.34:1 로 WCAG AA(4.5:1) 밖이고, 보조
  문구까지 `muted` 가 하한이다. 값을 옮기지 않은 이유는 구분선 · 비활성 자리에선 지금 값이 맞고
  소비처가 165곳이라 읽는 글자가 아닌 자리까지 같이 움직이기 때문이다.

  근거 · 실측: coldsurfers/public#106

- [#110](https://github.com/coldsurfers/public/pull/110) [`c0eaf13`](https://github.com/coldsurfers/public/commit/c0eaf1348431d58f9241047f4f5dafa13993e221) Thanks [@yungblud](https://github.com/yungblud)! - RN `Text` 도 `textStyle` 을 받는다 — 두 레인이 같은 램프 표를 읽는다.

  웹이 `textStyle` 한 축으로 정리된 동안 RN 은 `size`·`weight`·`leading` 세 축이라, 같은 시안이
  두 레인에서 다르게 설 수 있었다. 표(`contract/text-style.ts`)는 이미 공유 자리에 있었고 RN 이
  읽기만 하면 됐다.

  `tokens/native` 에 `letterSpacingFor(size, track)` 를 낸다. RN 의 자간은 `em` 이 아니라 절대
  포인트라 크기와 짝을 지어야 값이 나온다 — `lineHeightFor` 와 같은 수법이다(`base`·`normal`
  → `16 × -0.02 = -0.32`). 이 변환이 생기면서 `editorialType` 의 RN 제외 사유에서 자간이 빠졌다.
  남은 건 `display` 의 `clamp()` 크기뿐이다.

  **`family` 축은 뺀다 — 깨는 변경이다.** 웹 `Text` 에는 없는 축이라(웹은 서체를
  `sprinkles({ fontFamily })` 로 밀어냈다) 두 레인 정렬이라는 이 판의 목적과 어긋난다. RN 은
  `sans` 로 고정하고, serif·mono 가 필요한 자리는 `style={{ fontFamily: nativeFontFamily.mono }}`
  로 간다. 첫 소비처(billets-app)의 `<Text>` 8곳에서 `family` 사용이 0건이라 지금이 major 없이
  지울 수 있는 자리다. 0.x 라 슬롯은 minor 에 둔다.

  **나머지 기존 동작은 그대로다.** `textStyle` 은 기본값이 없고, 낱개 축(`size`·`leading`)이 주어지면
  그쪽이 이긴다. 지금 기본값(`base`·`normal`)과 `textStyle="body"`(`base`·`relaxed`)의 행간이
  달라서, 기본으로 깔면 이미 배포된 화면의 줄 간격이 조용히 바뀐다. 축을 뒤집는 건 major 에서 한다.
  자간도 `textStyle` 을 준 경우에만 박힌다.

- [#109](https://github.com/coldsurfers/public/pull/109) [`57e7dd1`](https://github.com/coldsurfers/public/commit/57e7dd14931753fc51f58a65d8c2efcef0718d6b) Thanks [@yungblud](https://github.com/yungblud)! - 웹 `Text` primitive 를 낸다 — `<Text as textStyle weight color maxLines>`.

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

- [#108](https://github.com/coldsurfers/public/pull/108) [`027b10b`](https://github.com/coldsurfers/public/commit/027b10b212f8b0f4bd35c803181407bb988f4fa3) Thanks [@yungblud](https://github.com/yungblud)! - 글자의 합성 슬롯을 낸다 — `text(name, { weight })` 와 그 정본인 `TEXT_STYLE_SPEC` 7단계
  (`heading` · `title` · `body` · `bodySm` · `label` · `labelSm` · `micro`).

  크기 축만 토큰이고 행간·자간을 호출부가 각자 정하면 같은 역할의 글자가 지면마다 다르게 선다.
  실측(public + paul-rockstar)에서 `fontSize` 가 들어간 `sprinkles` 호출 478건에 구별되는 조합이
  46가지였고, 그중 대다수가 `lineHeight` 를 비운 채였다 — 비우면 상속값이 들어오므로 정해진 적 없는
  행간이 화면에 서는 셈이다. 램프 7단계는 그 실측의 크기 분포에서 나왔고, 역할이 서지 않은
  `lg`(18px, 8건)는 단계를 주지 않았다.

  `fontWeight` 는 묶지 않는다 — 같은 크기에 굵기가 2~3종씩 붙어서 이름에 넣으면 7단계가 21개가
  된다. 색도 밖에 둔다. 둘 다 램프와 직교한 축이다.

  표는 `contract/text-style.ts` 에 둔다(`CHIP_SPEC` 선례). RN `native/Text` 가 웹과 같은 나이브
  모델(`size`·`weight`·`leading` 따로)이라 같은 표를 읽을 자리가 필요하고, VE 산출물은 CSS
  문자열이라 RN 으로 못 넘어간다. 이번 판은 웹 레인만 굽는다.

  새 진입점은 만들지 않았다 — `text` 는 메인 배럴에서 나간다. `.css.ts` 는 함수를 export 할 수
  없어(VE 가 exports 를 직렬화한다) 클래스 맵(`css/text.css.ts`)과 조합 함수(`css/text.ts`)가
  갈렸다.

## 0.15.0

### Minor Changes

- [#103](https://github.com/coldsurfers/public/pull/103) [`09d0cdc`](https://github.com/coldsurfers/public/commit/09d0cdce6053a980ae530dc979c07c2a64fb228e) Thanks [@yungblud](https://github.com/yungblud)! - `ConcertCard`(`bare`)에 커버 비율 축을 연다 — `coverRatio?: 'landscape' | 'square'`, 기본
  `landscape`(4:3)라 기존 소비처는 바뀌지 않는다.

  `CONCERT_CARD_BARE_SPEC.coverAspectRatio` 가 단일 숫자에서 축별 표로 바뀌었고, 웹은
  `bareCoverRatio` variants 로 RN 은 `styled` 에서 같은 표를 읽는다. 임의 비율을 prop 으로 받지
  않는 이유: 커버는 카드 정체성이라 지면마다 다른 비율이 생기면 같은 카드로 안 보인다.

  `square` 를 여는 자리는 billets-app 홈 레일 시안(정사각 146×146)이다.

- [#103](https://github.com/coldsurfers/public/pull/103) [`09d0cdc`](https://github.com/coldsurfers/public/commit/09d0cdce6053a980ae530dc979c07c2a64fb228e) Thanks [@yungblud](https://github.com/yungblud)! - `./native` 에 `Chip` 을 낸다 — 웹 `primitives/Chip` 의 축(size 2 · active)을 RN 으로 옮긴 것.

  치수와 색 배정은 새 `contract/chip.ts` 의 `CHIP_SPEC` 하나를 두 레인이 읽는다. 웹 `Chip.css.ts`
  가 리터럴로 들고 있던 35·26·14·10 이 그 표로 올라갔고, `:hover`·`transition` 만 웹에 남는다 —
  RN 엔 짝이 없어 갈라질 상대가 없다.

  RN 엔 자리가 없는 셋(`as` · `asChild` · `className`)은 prop 을 두지 않았다. 있는데 안 먹는
  prop 은 거짓말을 한다.

- [#103](https://github.com/coldsurfers/public/pull/103) [`09d0cdc`](https://github.com/coldsurfers/public/commit/09d0cdce6053a980ae530dc979c07c2a64fb228e) Thanks [@yungblud](https://github.com/yungblud)! - `./native` 에 `Skeleton` 을 낸다 — 웹 `primitives/Skeleton` 의 축(`width`·`height`·
  `aspectRatio`·`radius`·`tone`)을 RN 으로 옮긴 것.

  맥동·톤 알파는 새 `contract/skeleton.ts` 의 `SKELETON_SPEC` 을 두 레인이 읽는다. 웹
  `css/motion.css.ts` 의 keyframes 도 이제 그 표에서 duration·easing·최저 불투명도를 가져온다.

  맥동은 **RN 코어 `Animated`** 로 낸다 — `react-native-reanimated` 를 peer 로 물지 않는다.
  자리표시자 하나를 위해 소비자에게 네이티브 의존을 지우는 값은 안 낸다(`Spinner` 와 같은 판단).
  모션 감소 설정이면 맥동을 끄고 한 톤 죽인 정지 상태로 둔다.

  치수 축은 **좁혀서** 옮겼다. 웹 `width` 는 임의 CSS 길이를 받지만 RN 은 `DimensionValue`
  뿐이고, `aspectRatio` 는 웹이 문자열 RN 이 숫자다 — 같은 표현이 아니라 계약에 올리지 않았다.

  `tokens/native` 에 `withAlpha` 가 함께 열린다 — 웹 `alpha()`(`color-mix`)의 RN 짝(`rgba`)이다.

## 0.14.0

### Minor Changes

- [#62](https://github.com/coldsurfers/public/pull/62) [`c5803cf`](https://github.com/coldsurfers/public/commit/c5803cfcf118fd510e4c9df53ebc40b5801b3183) Thanks [@yungblud](https://github.com/yungblud)! - `./native` 에 `ConcertCard` 를 낸다 — 웹 `cards/ConcertCard` 의 `bare` 섀시를 RN 으로 옮긴 것. 두 레인이 `contract/concert-card.ts` 하나를 읽는다(props · 치수 표 · variant 축)라 값이나 이름이 갈릴 수 없다. native 는 `bare` 만 구현하므로 그쪽엔 `variant` prop 이 없다.

- [#62](https://github.com/coldsurfers/public/pull/62) [`7fc0023`](https://github.com/coldsurfers/public/commit/7fc0023d6eb71391c8b69bbd1b7d0b0875b5859c) Thanks [@yungblud](https://github.com/yungblud)! - native 레인에 컴포넌트별 진입점을 연다 — `./native/Button` 처럼.

  Metro 는 tree-shaking 을 하지 않아 `./native` 배럴을 열면 9개가 전부 번들된다.
  서브패스로 열면 `Button` 기준 전이 폐포가 18,044 → 6,917 B (-62%) 다.
  배럴은 그대로 남으므로 기존 소비처는 바꿀 것이 없다.

## 0.13.0

### Minor Changes

- [#55](https://github.com/coldsurfers/public/pull/55) [`745d09a`](https://github.com/coldsurfers/public/commit/745d09a580b72ffcb232a34b4dc0858e917d552e) Thanks [@yungblud](https://github.com/yungblud)! - `./layers` 진입점 추가 — `@layer` 이름과 `LAYER_ORDER` 만 담고 CSS 를 안 문다.

  배럴(`.`)은 `styles.css` 를 물어서 번들러 없는 Node 에서 열리지 않는다(`Unknown file extension ".css"`). 순서를 검사하는 쪽이 대개 그 자리다 — 소비 레포의 pre-push 게이트가 `LAYER_ORDER` 를 읽어 상대 순서를 본다. `./tokens`·`./style-utils` 와 같은 규율(값만 필요한 소비자는 CSS 를 지불하지 않는다)의 넷째 진입점.

  배럴은 같은 다섯 이름을 그대로 재수출한다 — 기존 소비자에 변화 없음.

## 0.12.0

### Minor Changes

- [#53](https://github.com/coldsurfers/public/pull/53) [`b4ee4db`](https://github.com/coldsurfers/public/commit/b4ee4db6d356406e66774388d083be92c130acfd) Thanks [@yungblud](https://github.com/yungblud)! - `./tokens.css` 진입점 추가 — `:root` 변수만 담은 한 장(2.5 kB).

  `styles.css` 는 `cssCodeSplit: false` 라 리셋·primitives·cards 가 한 장에 다 실린다. Tailwind
  나 순수 CSS 로 화면을 짜면서 색·간격만 우리 값으로 맞추려는 앱은 그 전량을 물 이유가 없다.

  무레이어 `:root` 다 — 소비 앱이 레이어 순서를 선언하지 않으면 `@layer` 블록은 무레이어 규칙에
  항상 진다. 변수 선언은 캐스케이드 다툼의 대상이 아니라 값의 바닥이다.

  두 시트를 같이 물어도 안전하다. 같은 이름에 같은 값이다.

## 0.11.0

### Minor Changes

- [#18](https://github.com/coldsurfers/public/pull/18) [`e4420c7`](https://github.com/coldsurfers/public/commit/e4420c7db9a7c3cb4a5e1e606119d4dfdc73b143) Thanks [@yungblud](https://github.com/yungblud)! - CSS 를 무는 진입점(`index`·`primitives`·`cards`·`layout`·`motion`·`sprinkles`)이 `styles.css` 를 직접
  물고 온다. 소비자는 `import '@coldsurfers/design-system/styles.css'` 를 더 쓰지 않아도 된다.

  ⚠️ **기존 배선을 지워야 한다.** `./styles.css` export 는 그대로 남지만, 남겨 두면 CSS 가 두 번
  실린다 — `cssCodeSplit` 을 켠 소비처에서는 서로 다른 청크로 각각 나가 번들러가 합치지 못한다
  (web-next 실측: client CSS 237 kB → 183 kB, 54.5 kB 가 중복이었다).

  `native`·`tokens`·`tokens-native`·`style-utils` 는 제외했다: RN 이 CSS 를 물면 Metro 가 깨지고,
  값·헬퍼 진입점은 번들러 없이 Node 에서 여는 길을 남긴다.

## 0.10.0

### Minor Changes

- [#43](https://github.com/coldsurfers/public/pull/43) [`97aa718`](https://github.com/coldsurfers/public/commit/97aa7180e26898a814fc42069db5b4390224d04a) Thanks [@yungblud](https://github.com/yungblud)! - `EmptyState` 추가, sprinkles 에 `textAlign` 축 추가 (coldsurfers/public#42 Phase 1)

  「아직 아무것도 없습니다」 자리가 web-next 에 5벌 흩어져 있었다 — `Tonight` · `NearBy` ·
  `ThisWeekend` · `NotificationsSurface` · `WorkSearch`. 컴포넌트가 드는 건 **세우는 방식 다섯 줄**
  (`flex` 세로 스택 · 가운데 정렬 · `textAlign` · `gap`)뿐이다.

  - **조판을 props 로 받지 않는다.** 5벌의 제목 조판이 이미 셋으로 갈려 있어(`xl/strong/700` ·
    `base/500/text` · `15px/text`) `title`/`description` 으로 접으면 정본을 골라야 하고 다섯 중
    넷이 시각적으로 바뀐다. 조판은 `children` 이 든다 — 덕분에 액션 슬롯도 필요 없다
    (`NearBy` 는 CTA 자리에 링크가 아니라 *반경 넓히기 버튼 N개*가 들어간다)
  - **바깥 여백을 소유하지 않는다.** 실측 셋(80·64·24px)이 전부 space 스케일에 떨어져 호출부
    sprinkles 한 줄로 내려간다 — `PageBanner`·`Callout`·`UnderlineTabs` 와 같은 규율
  - **`gap` 만 컴포넌트 몫.** 실측이 16px : 8px 로 갈려 다수를 정본으로 골랐다. CTA 가 서는
    클러스터라 여백이 좁으면 버튼이 문구에 붙는다
  - `asChild` — 지면이 이미 `Container` 로 셸을 세운 자리에서 래퍼가 겹치지 않게 한다

  ⚠️ 이름이 `ContentPlaceholder` 가 아닌 이유: seed 의 같은 이름은 *이미지가 안 뜬 자리*의 아이콘
  박스고, 그 축은 `CoverBlock` 이 이미 든다.

  sprinkles `textAlign` 축은 `EmptyState` 의 가운데 정렬을 소비처가 뒤집을 자리로 열었다.
  `ds-utilities` 라 `ds-components` 를 확실히 이긴다 — 로컬 `.css.ts` 로 덮으면 같은 레이어 안에서
  소스 순서가 승자를 정하게 된다. 덤으로 web-next 7개 파일의
  `style(inComponentsLayer({ textAlign: 'center' }))` 복붙이 사라진다.

## 0.9.0

### Minor Changes

- [#40](https://github.com/coldsurfers/public/pull/40) [`0c02c30`](https://github.com/coldsurfers/public/commit/0c02c3023f4b0eac2523ff4ea7d7f749885b3e0b) Thanks [@yungblud](https://github.com/yungblud)! - `UnderlineTabs`/`UnderlineTab` 추가, `Chip` 에 `asChild` 추가 (coldsurfers/public#39 Phase 1)

  밑줄 탭이 web-next 에 4벌 흩어져 있었다 — `VenueDetail` · `SettingsTop` · `StageSearchOverlay` ·
  `DailyIndex`. 4벌이 **이미 완전히 일치하던 것**(비활성 `muted` + `:hover strong` · 활성 밑줄 2px ·
  활성 굵기 700)만 컴포넌트가 들고, 갈라져 있던 건 정본을 골라 접었다.

  - 여백·`gap` 은 소유하지 않는다 — 실측 4벌이 12·10·7px 에 하나는 `paddingTop` 구조, `gap` 은
    4벌 4값이다. 셸 치수는 지면이 안다는 `PageBanner`·`Callout` 규율 그대로
  - `-1px` 겹침을 컴포넌트가 든다 — 없으면 밑줄이 줄 괘선 **아래로 1px 뜬다.** 4벌 중 둘이 실제로 떠 있었다
  - 선택 신호는 엘리먼트가 정한다 — `asChild`(링크)면 `aria-current="page"` 를 기본으로 넣고,
    `<button>` 이면 `aria-pressed`. 라우팅 링크에 `role="tab"` 은 틀렸다(화살표 키 요구를 못 지킨다)

  `Chip` 은 **스타일이 한 줄도 안 바뀐다.** `active` 의 시각 언어(반전)를 정본으로 확정하고,
  필터 칩이 크롤 가능한 `<a href>` 로 나갈 수 있도록 `asChild` 만 열었다.

## 0.8.0

### Minor Changes

- [#37](https://github.com/coldsurfers/public/pull/37) [`fd53724`](https://github.com/coldsurfers/public/commit/fd53724589e91f9f75fd49002b12d26c4b2b7fb0) Thanks [@yungblud](https://github.com/yungblud)! - `Callout` primitive 를 연다 — 본문 흐름에 끼는 인라인 알림 상자.

  `tone`(`accent`·`success`·`warning`·`danger`) 축과 `action` 슬롯. 소비처 둘이 같은 역할을 하면서
  **공유하는 값이 하나도 없던** 상태를 흡수한다 — 틴트 메커니즘 둘(손수 `color-mix` vs `XBg` 토큰),
  농도 둘(7% vs 14%), radius 둘(12 vs 10), padding 둘.

  틴트는 **톤 전경 토큰에서 파생**한다(배경 14% · 테두리 28%). `statusSuccessBg` 를 조회하지 않는 건
  `color-mix(statusSuccess 14%, transparent)` 와 수치가 같은데다, `accent` 엔 `XBg` 짝이,
  테두리엔 `XBorder` 토큰이 아예 없어서다 — 조회로 통일하려면 토큰 계약을 늘려야 한다. **토큰은
  건드리지 않았다.**

  `role` 은 붙여주지 않는다(`...rest` 통과). 같은 상자가 읽혀야 할 때와 읽히면 방해일 때가 있고
  그건 DS 가 알 수 없는 맥락이다. `margin` 도 소유하지 않는다 — 바깥 여백은 지면 몫.

  근거·결정 로그 6건: coldsurfers/public#34

## 0.7.0

### Minor Changes

- [#35](https://github.com/coldsurfers/public/pull/35) [`6decbe5`](https://github.com/coldsurfers/public/commit/6decbe5e3ab84ac74823fc2a8fd23c99ceafd96b) Thanks [@yungblud](https://github.com/yungblud)! - `./layout` 에 `PageBanner` 를 추가한다 — 다크 풀블리드 밴드(바닥 · 셸 · `Title`/`Body` 타이포).

  가로축은 `Container` 가 그대로 든다. 소비처 둘이 `max-width:1440px` + gutter 를 각자 다시
  선언하다 브레이크포인트가 갈렸던 게(tablet vs desktop) 발단이라, 새 셸을 만들지 않고
  `Container` 위에 세로 여백만 얹는다.

  `align` 축은 열지 않았다 — 두 소비처의 정렬이 다르지만 각 정렬의 실사용이 1곳씩이라 추출할
  중복이 없다. 배치는 `children` 이 정한다. 근거·결정 로그: coldsurfers/public#33

## 0.6.0

### Minor Changes

- [#31](https://github.com/coldsurfers/public/pull/31) [`7e59cb5`](https://github.com/coldsurfers/public/commit/7e59cb5f7c8f3958c64e52e650872c2dbd9fdb12) Thanks [@yungblud](https://github.com/yungblud)! - `Modal` 에 `placement` 축을 연다 — `center`(기본) · `top` · `bottom`. `bottom` 이 바텀시트 자리다.

  소비처 실측 5곳 중 4곳이 `sprinkles({ alignItems: 'center', justifyContent: 'center' })` 를 문자 그대로 복붙하고 있었다. 축이 없던 게 아니라 기본값이 없었다. 기존 소비처는 기본값 `center` 로 픽셀이 그대로다.

  오버레이의 `padding` 이 base 에서 placement variant 로 내려갔다 — `bottom` 만 0 이라 base 에 두고 덮으면 같은 레이어 안 소스 순서에 기대는 규칙이 된다.

## 0.5.1

### Patch Changes

- [#28](https://github.com/coldsurfers/public/pull/28) [`6aaf5da`](https://github.com/coldsurfers/public/commit/6aaf5da90e6fdbbfab4f1e838502eeba2d555cb1) Thanks [@yungblud](https://github.com/yungblud)! - `pulse` 가 `prefers-reduced-motion: reduce` 를 존중한다 — 맥동을 끄고 불투명도 0.6 의 정지 상태로 둔다(`ThinkingDots` 와 같은 처리). `Skeleton` 이 `pulse` 를 품고 있어 소비처는 아무것도 안 바꿔도 된다.

## 0.5.0

### Minor Changes

- [#26](https://github.com/coldsurfers/public/pull/26) [`a6d3b54`](https://github.com/coldsurfers/public/commit/a6d3b54b6f55564127a248a1bc1e47eb0bbfd428) Thanks [@yungblud](https://github.com/yungblud)! - `./primitives` 에 `Skeleton` 을 추가한다.

  로딩 자리표시자를 한 어휘로 묶는다. 치수는 단일값 props(`width`·`height`·`aspectRatio`)로 받고,
  `@media` 분기는 `className` 이 맡는다. 바탕은 `neutral`·`onCover` 두 톤이고 `aria-hidden` 은
  기본으로 박힌다. 이미 치수를 가진 스타일 위에 맥동만 얹는 자리는 `asChild`.

  `cards/ConcertCardSkeleton` 의 `barBase` 는 같은 톤 소스(`skeletonToneValue.neutral`)를 읽는다 —
  값은 그대로라 시각 변화는 없다.

## 0.4.0

### Minor Changes

- [#20](https://github.com/coldsurfers/public/pull/20) [`067238c`](https://github.com/coldsurfers/public/commit/067238c2796a10fe136f15f718529237857bb1d2) Thanks [@yungblud](https://github.com/yungblud)! - `./layout` 진입점 추가 — 표면 레이아웃 `Page` · `Container`.

  seed-design 의 `AppScreen`(stackflow) 이 모바일 스택 화면에 하는 일을 웹 문서 표면으로 옮긴 것.
  `Page` 는 `min-height:100vh` 세로 스택 + `data-surface` 마커 + 표면 스타일 주입구(`style`),
  `Page.Content` 는 `<main>` + `flex:1` 로 짝을 이룬다. `Container` 가 gutter 정본
  (`max-width:1440px` · `padding-inline` 6/16).

  상·하단 chrome 은 슬롯 래퍼 없이 `Page` 의 자식으로 놓는다 — 헤더/푸터 내용물과 표면 팔레트는
  소비 앱의 것이다. 근거·결정 로그: coldsurfers/public#19

  `Container` 는 `as` 로 태그를 고른다(`div` 기본 · `section`/`main`/`aside`/`header`/`footer`).
  gutter 는 정렬축이지 의미가 아니라서, 같은 세로선에 서는 것들이 표면 안에서 `<section>`·`<div>`·
  `<main>` 으로 갈린다 — 실측 web-next 34곳 중 26곳이 `<section>` 이다.

## 0.3.0

### Minor Changes

- [#12](https://github.com/coldsurfers/public/pull/12) [`9a68a61`](https://github.com/coldsurfers/public/commit/9a68a61a1ff0e23fa06565af220efaeed536246b) Thanks [@yungblud](https://github.com/yungblud)! - 카드 4종을 흡수한다 — `ConcertCard` · `ConcertCardSkeleton` · `ArticleCard` · `LeadFeature`.
  새 서브패스 `./cards` 로 연다.

  primitives 와 가르는 선은 **합성 깊이**다. `Button` 은 자기 하나로 끝나지만 카드는
  `CoverBlock` · `Eyebrow` 를 안에서 조립하고, 그래서 API 도 값이 아니라 슬롯(`footer` ·
  `coverAction`)을 받는다. 도메인은 이름에만 남았다 — `ConcertCard` 의 props 는
  `title` · `meta` · `tone` 이라 공연 스키마를 모르고, 라우터도 안 문다.

  진입점이 갈린 이유는 JS 뿐이다. `cssCodeSplit: false` 라 CSS 는 `styles.css` 한 장에
  함께 실린다 — **44.8 kB → 51.3 kB**(gzip 8.18 kB).

## 0.2.0

### Minor Changes

- [#10](https://github.com/coldsurfers/public/pull/10) [`791d3bb`](https://github.com/coldsurfers/public/commit/791d3bbf780bf0ccecbeea56a3efd2372e5b6cb2) Thanks [@yungblud](https://github.com/yungblud)! - ink(dark) 스킴을 폐기하고 light 단일 스킴으로 전환한다. `tokens.color.semantic` 이 `{ light }` 만 갖고, `styles.css` 의 `:root` 는 light 색을 굽는다 — `:root[data-theme='light']` 오버라이드 블록은 사라졌다. RN 쪽에서도 뒤집을 축이 없어져 `ColorSchemeProvider` 와 `SchemeName` 을 걷어냈다. 색 **객체**를 읽는 `useScheme()` 은 호출 계약 그대로 남는다.

  이 패키지는 2026-08-11 에 paul-rockstar 에서 tokens 를 추출하며 dark·light 2스킴 상태로 굳었는데, 원본이 11일 뒤 `[#299](https://github.com/coldsurfers/public/issues/299)` 로 dark 를 폐기하면서 그 결정만 전파되지 않았다. 그 결과 소비 앱은 이 패키지의 dark `:root` 를 자기 light CSS 로 되덮어야 화면이 나왔고, `@import` 두 줄의 순서 하나에 스킴이 걸려 있었다. 값은 드리프트가 없었다 — light 팔레트 29개가 양쪽에서 동일했고, 갈린 건 어느 스킴이 `:root` 인가 하나뿐이다.

  **breaking:** `ColorSchemeProvider` · `SchemeName` 제거, `tokens.color.semantic.dark` 제거. dark 표면을 쓰던 소비자는 자기 CSS 에서 커스텀 프로퍼티를 다시 선언해야 한다.

## 0.1.2

### Patch Changes

- [#8](https://github.com/coldsurfers/public/pull/8) [`52411d7`](https://github.com/coldsurfers/public/commit/52411d75fac0b7008d85b847eb45c73b60d247e2) Thanks [@yungblud](https://github.com/yungblud)! - `coverTone` 을 `primitives` 배럴에서 내보낸다. `CoverBlock.tsx` 는 이미 재수출하며 그 이유를 주석으로 적어 뒀는데(색면이 아닌 표면 — 아바타 원 등 — 이 같은 팔레트를 쓴다) 배럴이 따라가지 않아, 소비처가 딥 경로 없이는 집어갈 수 없었다.

## 0.1.1

### Patch Changes

- [#6](https://github.com/coldsurfers/public/pull/6) [`53fd7a5`](https://github.com/coldsurfers/public/commit/53fd7a52658692a2a0dbee49b6bfb7df15245430) Thanks [@yungblud](https://github.com/yungblud)! - 발행 CSS 의 `@layer` 순서를 바로잡는다. `motion.css.ts` 가 `vars` 를 안 써서 contract 를 거치지 않는 유일한 `.css.ts` 였고, 그 탓에 `cssCodeSplit: false` 번들의 맨 앞에 실려 `ds-components` 를 첫 레이어로 등록했다. `ds-components` 가 가장 약한 레이어가 되면 Tailwind preflight(`base`)가 컴포넌트를 이겨 padding·border 가 지워진다. `./layers.css` 를 부수효과로 물려 순서 선언이 먼저 실리게 했다.

## 0.1.0

### Minor Changes

- [`344b2a7`](https://github.com/coldsurfers/public/commit/344b2a792c25468b7e4835ae05aac76263ce6ec7) Thanks [@yungblud](https://github.com/yungblud)! - feat(design-system): primitives 흡수 + RN native 레인
