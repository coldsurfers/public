'use client'

import { Button, Text } from '@coldsurfers/design-system/native'
import { nativeSpacing, paper } from '@coldsurfers/design-system/tokens/native'
import { MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { PhoneFrame } from '../phone-frame'
import { ALL_GENRES, feedFor, GENRES, type Genre, toFeedEvent } from './feed-data'
import { FeedEventCard, FeedEventCardSkeleton } from './feed-event-card'
import { FeedSection, FeedSectionSkeleton } from './feed-section'
import { GenreStrip } from './genre-strip'
import { TAB_BAR_HEIGHT, TABS, TabBar } from './tab-bar'

/**
 * billets-app 의 **첫 화면**(1번째 탭 `피드`)을 COLDSURF DS 로 리스킨한 것.
 *
 * 원본: `surfers-root/apps/billets-app/src/screens/feed-main-screen/feed-main-screen.tsx`.
 *
 * ## 이 시안이 증명하려는 것
 *
 * "Figma 없이 DS 만으로 시안이 서는가." 그래서 눈속임 마크업을 쓰지 않는다 — 카드는 진짜
 * `ConcertCard`, 버튼은 진짜 `Button` 이다. 비슷하게 생긴 것으로 그리면 시안은 예뻐지고
 * 판정은 무의미해진다.
 *
 * ## 왜 `div` 가 하나도 없나
 *
 * 원본이 React Native 앱이라 **여기도 RN 으로 짠다.** `View`·`ScrollView`·`Pressable` 을
 * `react-native` 에서 가져오고, DS 도 웹 레인이 아니라 `./native` 를 문다. 브라우저에서 도는 건
 * `next.config.mjs` 의 `react-native` → `react-native-web` 별칭 덕이다.
 *
 * 그래서 이 트리는 **billets-app 에 그대로 붙는 코드**다. 웹으로 그린 시안이라면 "RN 에서도
 * 되겠지" 가 추측으로 남는데, RN 으로 그리면 그 추측이 없다.
 *
 * 두 곳만 웹이다:
 *   - 폰 프레임과 기기 크롬 — [`../phone-frame.tsx`](../phone-frame.tsx) 로 **빠져 있다.**
 *     status bar·home indicator 는 화면이 아니라 기기라, 이 파일 안에 두면 앱으로 옮길 때
 *     지워야 할 코드가 화면 한가운데에 남는다. 그래서 이 파일에서 보이는 트리가 곧 앱에
 *     붙일 트리다 — 프레임은 시안들이 같이 쓰는 자리라 `playground/` 층에 산다
 *   - 아이콘(`lucide-react`) — 실제 RN 은 `lucide-react-native` 로 바꾼다. 이름·props 가 같아
 *     import 한 줄이고, RNW 에선 web 판이 그대로 그려져 시안 판정엔 지장이 없다
 *
 * ## 파일이 왜 여섯인가 — **집어갈 수 있는 단위로 자른 것**
 *
 * 앞선 판은 한 파일 487줄이었다. 그리는 데는 문제가 없는데 *가져다 쓰려는 순간* 막힌다 —
 * 어디부터 어디까지가 한 덩어리인지, 무엇이 DS 로 갈 것이고 무엇이 앱에 남을 것인지가
 * 파일 안에서 구분되지 않았다. 그래서 **판정 단위로 자르고, 각 파일 머리말에 자기 판정을**
 * 적었다:
 *
 * | 파일 | 무엇 | P3 판정 |
 * | --- | --- | --- |
 * | [`feed-section.tsx`](./feed-section.tsx) | 제목 블록 + 가로 레일 (데이터 모름) | **흡수 1순위** — 소비처 둘 |
 * | [`feed-event-card.tsx`](./feed-event-card.tsx) | `ConcertCard` + 담기 + 레일 폭 | 앱에 남는다 |
 * | [`genre-strip.tsx`](./genre-strip.tsx) | 언더라인 장르 탭 | 보류 — 소비처 하나 |
 * | [`tab-bar.tsx`](./tab-bar.tsx) | 4탭 바 | 보류 — 네비 의존을 끌고 온다 |
 * | [`feed-data.ts`](./feed-data.ts) | DTO 모양 목업 + `toFeedEvent` seam | 목업 |
 * | 이 파일 | 기기 크롬 · 화면 상태 · 조립 | 앱에 남는다 |
 *
 * 규칙의 정본은 AGENTS.md 「무엇을 여기로 옮기는가」이고, 근거는 각 파일이 자기 머리말에서
 * 댄다 — 여기 모아 적으면 파일을 옮길 때 판정이 따라오지 않는다.
 *
 * ## 소비 레포에서 어떻게 쓰나
 *
 * - **surfers-root / billets-app** — `feed-event-card.tsx` 를 집어가 `ConcertListItem` 자리에
 *   끼우고, `toFeedEvent` 를 실 DTO 어댑터로 바꾼다. `feed-section.tsx` 는 DS 로 올라갈 때까지
 *   `FeedHorizontalEvents` 자리에 그대로 들어간다
 * - **paul-rockstar / web-next** — 카드·레일은 이미 자기 것이 있다(`EventCard`·`HorizontalShelf`).
 *   여기서 가져갈 것은 **`FeedSection` 의 prop 모양**이다 — `TrendingRailLayout` 이 같은 셋을
 *   들고 있어서, DS 로 올릴 때 두 표면이 같은 이름을 쓰는지 여기서 먼저 맞춰 본다
 *
 * ## Figma 이식 (`Axp7xi5pl6K4Rvq9cPGSuQ` · `2467:1095`)
 *
 * 같은 앱의 **커뮤니티** 화면 시안에서 *시각 언어만* 가져왔다 — 화면 내용은 피드 그대로다.
 * 넘어온 것 넷: 기기 크롬 · `3xl` 페이지 제목 · 언더라인 탭 스트립 · accent 로 표시하는
 * active 상태. 이 넷은 전부 DS 어휘 안에서 서므로 새 컴포넌트가 필요 없었다.
 *
 * ⚠️ **넘어오지 못한 것 하나 — 풀폭 가로 리스트 카드.** 시안의 주력 카드는 커버가 왼쪽,
 * 텍스트가 오른쪽인데 `ConcertCard` 는 **웹·native 양쪽 다 `flexDirection: 'column'` 전용**이고,
 * 치수 표(`CONCERT_CARD_BARE_SPEC`)는 공개 export 가 아니다. 여기서 조립하면 커버 치수를 두 번
 * 적게 되어 계약이 갈린다. 그래서 레일 카드를 그대로 뒀다 — **가로 축은 웹에 먼저 열어야
 * 한다**(순서 규율). P3 본편이 여기다.
 *
 * 데이터는 목업이다. 넣지 않은 동작: 화면 이동 · 무한 스크롤 · pull-to-refresh · 위치 모달.
 * 넣은 동작은 셋뿐이고 전부 **화면의 모양을 바꾸기 때문에** 넣었다 — 장르 전환 · 로딩 · 담기.
 */

/**
 * 장르를 바꿀 때 스켈레톤이 보이는 시간.
 *
 * **목업 전용 장치다.** 원본에서 이 자리는 `withSuspense(…, <FeedHorizontalEvents.Skeleton/>)`
 * 이 쿼리 대기 중에 만드는 상태라 시간이 네트워크에서 온다. 여기 숫자는 그 상태를 *눈으로
 * 볼 수 있게* 하는 것 이상의 뜻이 없다 — 스켈레톤이 실섹션과 같은 조판인지는 보지 않으면
 * 판정할 수 없고, 안 보이면 그 조판이 어긋나도 아무도 모른다.
 */
const GENRE_SWITCH_MS = 420

/** 헤더 위치 라벨 — 도시를 잡았으면 도시 UI 이름, 아니면 `현재 위치`(원본 `LocationSelector`). */
const CITY_LABEL = '서울'

/** 스켈레톤 레일에 세울 카드 수. 원본은 6장인데 레일이 132 폭이라 화면에 3장 반이 걸린다. */
const SKELETON_CARDS = 4

export default function BilletsFeedPage() {
  const [city] = useState<string>(CITY_LABEL)
  const [genre, setGenre] = useState<Genre>(ALL_GENRES)
  const [tab, setTab] = useState<string>('feed')
  const [loading, setLoading] = useState(false)
  /**
   * 담기 — **서버 값 위에 얹는 낙관적 갱신**이다. 기본값은 DTO 의 `isSubscribed` 고,
   * 여기 키가 있으면 그게 이긴다. 원본도 같은 모양이라(`ConcertSubscribeButton` 이
   * 뮤테이션 결과를 기다리지 않는다) 목업이 구조를 왜곡하지 않는다.
   */
  const [savedOverrides, setSavedOverrides] = useState<Record<string, boolean>>({})

  const sections = feedFor(genre)

  // 장르가 바뀌면 새 쿼리가 나가는 자리 — 그동안 스켈레톤이 선다.
  useEffect(() => {
    if (genre.name === ALL_GENRES.name) return
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), GENRE_SWITCH_MS)
    return () => clearTimeout(timer)
  }, [genre])

  const toggleSave = (id: string, current: boolean) =>
    setSavedOverrides((prev) => ({ ...prev, [id]: !current }))

  return (
    <PhoneFrame>
      {/*
       * 바닥을 **여기서** 칠한다 — 프레임(`../phone-frame.css`)이 아니라. `.pf-frame` 의
       * `var(--bg)` 는 문서 사이트의 테마를 따르는데 native 스킴은 `light` 하나뿐이라, 사이트가
       * 다크면 어두운 글자가 어두운 바닥에 얹혀 제목이 통째로 사라진다. RN 앱은 자기 루트를
       * 자기가 칠하므로 원래 자리이기도 하다.
       *
       * ⚠️ 색이 `scheme.bg` 가 **아니다.** 둘은 다른 토큰이고 `tokens.ts` 가 이름을 갈라
       * 놓았다 — `scheme.bg`(`#f2efe8`)는 브랜드 정본 paper 고, `paper.warm`(`#fafaf7`)이
       * **시안의 라이트 고정 표면**이다. 시안(`2468:1264`) 픽셀을 세면 `#ffffff` 48.0% ·
       * `#fafaf7` 38.9% 이고 `#f2efe8` 은 등장하지 않는다. 브랜드색을 깔면 바닥이
       * 카드(`scheme.surface` = 흰색)와 붙어 **카드가 카드로 안 읽힌다** — 시안이 만드는
       * 대비가 정확히 그 두 값의 차이다.
       */}
      <ScrollView
        style={{ flex: 1, backgroundColor: paper.warm }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {/*
         * 헤더 — Figma 이식분이다. 원본은 브랜드 줄(로고 + `COLDSURF`) + 셀렉터 두 개인데,
         * 시안은 **페이지 제목**이 화면의 앵커라 그 자리를 제목이 가져간다. 브랜드는 앱
         * 아이콘과 스플래시가 이미 말하고 있어 화면마다 반복할 이유가 없다는 게 시안의 판단.
         *
         * 원본 `NavigationHeader.Brand` 는 스크롤에 따라 collapse 하는데 그건 안 옮겼다 —
         * measure 훅과 navigation 상태에 얽혀 있어 도메인 조립이고, 앱에 남는다.
         */}
        <View
          style={{
            backgroundColor: paper.warm,
            paddingHorizontal: nativeSpacing[4],
            paddingTop: nativeSpacing[2],
            paddingBottom: nativeSpacing[3],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/*
             * 화면의 유일한 최상위 제목이라 `3xl`(30) 로 세운다. 섹션 제목이 `lg`(18) 라
             * 네 눈금이 벌어지고, 그 간격이 곧 위계다 — 앞선 판은 최상위가 `xl` 이라
             * 섹션과 한 눈금 차였고 시선이 걸릴 자리가 없었다.
             */}
            <Text size="3xl" weight="semibold" tone="strong">
              피드
            </Text>

            {/*
             * LocationSelector — 누르면 `LocationSelectorModal`. 위치를 못 잡으면 `현재 위치`.
             * **고른 상태라 `accent` 다.** 시안이 accent 를 쓰는 자리도 정확히 여기 —
             * *지금 걸려 있는 조건* 이다.
             */}
            <Button variant="accent" size="sm">
              {/*
               * 웹 `Button` 은 `<MapPin/>{city}` 를 그냥 받는데 **여기선 못 받는다** —
               * RN 은 텍스트 스타일이 상속되지 않아 라벨을 `Text` 로 감싸야 한다.
               * Root 가 이미 row + gap 이라 조각 둘을 그대로 넘기면 된다.
               *
               * ⚠️ 그 대가로 **라벨 색을 소비처가 다시 계산한다.** `Button` 의 `labelColorFor`
               * 는 children 이 문자열일 때만 걸려서, 아이콘이 하나 붙는 순간 variant 가 정한
               * 색이 끊긴다. 아래 `'white'` 는 그 함수의 `accent` 분기를 손으로 옮겨 적은
               * 것이고, variant 가 늘면 이 자리가 조용히 어긋난다 — DS 가 leading 슬롯을
               * 열거나 라벨 색을 context 로 내려야 닫히는 구멍이다.
               */}
              <MapPin size={16} color="white" aria-hidden />
              <Text size="sm" style={{ color: 'white' }}>
                {city}
              </Text>
            </Button>
          </View>
        </View>

        <GenreStrip genres={GENRES} selected={genre} onSelect={setGenre} />

        {/*
         * 장르가 피드를 통째로 바꾼다 — 원본 `feed-main-screen.tsx` 의 `renderItem` 판정
         * 그대로다(`selectedGenres.length === 0` 이면 다섯 섹션, 아니면 장르 세트).
         * 앞선 판은 스트립이 값만 바꾸고 피드는 그대로여서, **화면에서 가장 큰 상태 변화가
         * 시안에 안 들어 있었다.**
         */}
        {loading ? (
          <FeedSectionSkeleton>
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 정적 스켈레톤 — 순서 불변
              <FeedEventCardSkeleton key={index} />
            ))}
          </FeedSectionSkeleton>
        ) : (
          sections.map((section) => (
            <FeedSection
              key={section.key}
              title={section.title}
              subTitle={section.subTitle}
              onPressMore={section.more ? () => undefined : undefined}
            >
              {section.events.map((dto) => {
                const event = toFeedEvent(dto)
                const saved = savedOverrides[dto.id] ?? event.saved
                return (
                  <FeedEventCard
                    key={dto.id}
                    event={{ ...event, saved }}
                    onToggleSave={(id) => toggleSave(id, saved)}
                  />
                )
              })}
            </FeedSection>
          ))
        )}
      </ScrollView>

      <TabBar tabs={TABS} selected={tab} onSelect={setTab} />
    </PhoneFrame>
  )
}
