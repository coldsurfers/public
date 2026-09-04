'use client'

import { Button, ConcertCard, Text, useScheme } from '@coldsurfers/design-system/native'
import type { CoverTone } from '@coldsurfers/design-system/tokens'
import { nativeSpacing, paper } from '@coldsurfers/design-system/tokens/native'
import {
  BatteryFull,
  Bookmark,
  House,
  MapPin,
  Search,
  Signal,
  Tickets,
  UserRound,
  Wifi,
} from 'lucide-react'
import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import './screen.css'

/**
 * billets-app 의 **첫 화면**(1번째 탭 `피드`)을 COLDSURF DS 로 리스킨한 것.
 *
 * 원본: `surfers-root/apps/billets-app/src/screens/feed-main-screen/feed-main-screen.tsx`
 * 와 `src/features/feed/ui/feed-horizontal-events.tsx`, `src/ui/tab-bar/tab-bar.tsx`.
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
 * 그래서 이 파일은 **billets-app 에 그대로 붙는 코드**다. 웹으로 그린 시안이라면 "RN 에서도
 * 되겠지" 가 추측으로 남는데, RN 으로 그리면 그 추측이 없다. 리스킨의 판정이 시안이 아니라
 * **이식 가능성**이 되는 지점이다.
 *
 * 두 곳만 웹이다:
 *   - 폰 프레임과 기기 크롬(`screen.css`) — status bar·home indicator 는 화면이 아니라
 *     **기기**다. 실제 앱에서 OS 가 그리는 자리라 RN 트리에 넣으면 옮길 때 지워야 한다
 *   - 아이콘(`lucide-react`) — 실제 RN 은 `lucide-react-native` 로 바꾼다. 이름·props 가 같아
 *     import 한 줄이고, RNW 에선 web 판이 그대로 그려져 시안 판정엔 지장이 없다
 *
 * ## 매핑
 *
 * | billets-app | COLDSURF DS |
 * | --- | --- |
 * | `ConcertListItem size="small"` (레일 카드) | `native/ConcertCard` |
 * | `ConcertSubscribeButton` (커버 오버레이) | `ConcertCard` 의 `coverAction` 슬롯 |
 * | `LocationSelector` | `native/Button variant="accent" size="sm"` (고른 상태) |
 * | `GenreSelector` | **없음** — 언더라인 탭 스트립으로 조립 |
 * | `NavigationHeader.Brand` 브랜드 줄 | **없음** — 페이지 제목으로 대체(아래 「Figma 이식」) |
 * | `FeedHorizontalEvents` 제목 블록 · 레일 | **없음** — 여기서 조립 |
 * | `TabBar` | **없음** — 여기서 조립 |
 *
 * 워딩은 원본 문자열이 정본이다 — 도시명 · `모든 장르` · 섹션 제목 5벌. **장르 4개
 * (`인디`·`록`·`재즈`·`일렉트로닉`)만 목업**이다: 원본 `GenreSelector` 는 모달이라 스트립에
 * 걸 라벨 목록이 없다. 리스킨은 값을 베끼는 게 아니라 어휘를 갈아끼우는 것이다.
 *
 * ## Figma 이식 (`Axp7xi5pl6K4Rvq9cPGSuQ` · `2467:1095`)
 *
 * 같은 앱의 **커뮤니티** 화면 시안에서 *시각 언어만* 가져왔다 — 화면 내용은 피드 그대로다.
 * 넘어온 것 넷: 기기 크롬 · `3xl` 페이지 제목 · 언더라인 탭 스트립 · accent 로 표시하는
 * active 상태. 이 넷은 전부 DS 어휘 안에서 서므로 새 컴포넌트가 필요 없었다.
 *
 * ⚠️ **넘어오지 못한 것 하나 — 풀폭 가로 리스트 카드.** 시안의 주력 카드는 커버가 왼쪽,
 * 텍스트 5줄이 오른쪽인데 `ConcertCard` 는 **웹·native 양쪽 다 `flexDirection: 'column'`
 * 전용**이고, 치수 표(`CONCERT_CARD_BARE_SPEC`)는 공개 export 가 아니다. 여기서 조립하면
 * 커버 치수를 두 번 적게 되어 계약이 갈린다 — `contract/concert-card.ts` 가 막으려던 바로 그
 * 일이다. 그래서 레일 카드를 그대로 뒀다. **가로 축은 웹에 먼저 열어야 한다**(순서 규율).
 *
 * `reserveTitleLines` 는 **끈다** — `ConcertCard` 주석이 정한 규율 그대로다. 예약은 그리드의
 * 것이고, 가로 레일은 1줄 제목 기준이라 예약하면 제목 아래 빈 줄이 생긴다.
 *
 * ## P3 흡수 판정 (AGENTS.md 「무엇을 여기로 옮기는가」)
 *
 * - **`FeedHorizontalEvents`(제목 + 레일) → 흡수 후보 1순위.** 셋을 전부 밀어낼 수 있고
 *   (title · subTitle · onPressMore · children), web-next 의 트렌딩 레일이 이미 같은 모양이다 —
 *   **두 번째 소비처가 이미 있다.** 규칙상 옮길 조건을 만족한다.
 * - **`ConcertCard` 가로 축 → P3 본편.** 위 ⚠️ 가 근거다. 시안이 요구하는데 어휘가 없어
 *   못 그린 유일한 자리고, 순서상 웹 `ConcertCard.css.ts` 부터 연다.
 * - **탭 스트립 → 보류.** `TabBar` 와 같은 이유 — 소비처가 이 시안 하나다.
 * - **`TabBar` → 보류.** 밀어낼 수는 있으나 소비처가 이 시안 하나다.
 * - **`NavigationHeader.Brand` → 앱에 남는다.** 스크롤 collapse 가 measure 훅과 navigation
 *   상태에 얽혀 있다. 그건 도메인 조립이다.
 *
 * 데이터는 목업이고 동작(모달 · 무한 스크롤 · 화면 이동)은 넣지 않았다 — 이 시안의 축이 아니다.
 */

interface Event {
  id: string
  title: string
  date: string
  venue: string
  tone: CoverTone
  initial: string
}

/** 섹션 = 원본의 `FeedHorizontalEvents.List` 한 벌. 제목·부제는 원본 문자열 그대로. */
interface Section {
  key: string
  title: string
  subTitle?: string
  more?: boolean
  events: Event[]
}

const E = (
  id: string,
  title: string,
  date: string,
  venue: string,
  tone: CoverTone,
  initial: string,
): Event => ({ id, title, date, venue, tone, initial })

const SECTIONS: Section[] = [
  {
    key: 'trending',
    title: '서울 지역 인기 공연',
    subTitle: '인기 상승 중인 공연',
    events: [
      E('t1', '실리카겔 SIREN', '7.24 금', '무신사 개러지', 'forest', 'ㅅ'),
      E('t2', 'HYUKOH & 落日飛車', '7.26 일', '올림픽공원', 'wine', 'ㅎ'),
      E('t3', '잔나비 단독 콘서트', '8.09 토', '롤링홀', 'moss', 'ㅈ'),
      E('t4', 'Parannoul 밴드셋', '8.15 금', '벨로주 홍대', 'steel', 'P'),
    ],
  },
  {
    key: 'new',
    title: '최근 추가된 공연',
    subTitle: '매일 오후 업데이트됩니다',
    events: [
      E('n1', '검정치마 전국투어', '9.05 금', 'YES24 라이브홀', 'plum', 'ㄱ'),
      E('n2', '새소년 여름 투어', '8.23 토', 'KT&G 상상마당', 'navy', 'ㅅ'),
      E('n3', '까데호 단독', '9.13 토', '무신사 개러지', 'forest', 'ㄲ'),
    ],
  },
  {
    key: 'tonight',
    title: '오늘 저녁 예정된 공연',
    subTitle: '매일 오후 업데이트됩니다',
    events: [
      E('g1', '아일리쉬 나잇', '오늘 19:00', '클럽 FF', 'wine', 'ㅇ'),
      E('g2', 'Drone Session vol.4', '오늘 20:00', '스트레인지프룻', 'steel', 'D'),
    ],
  },
  {
    key: 'recent',
    title: '최근에 확인한 공연',
    events: [
      E('r1', '検非違使 내한공연', '8.02 토', '웨스트브릿지', 'navy', 'ㄱ'),
      E('r2', '실리카겔 SIREN', '7.24 금', '무신사 개러지', 'forest', 'ㅅ'),
    ],
  },
  {
    key: 'all',
    title: '모든 이벤트',
    more: true,
    events: [
      E('a1', '펜타포트 락 페스티벌', '8.01 금', '송도 달빛축제공원', 'moss', 'ㅍ'),
      E('a2', '슬로우 라이프 슬로우 라이브', '9.20 토', '올림픽공원', 'plum', 'ㅅ'),
      E('a3', '그랜드 민트 페스티벌', '10.18 토', '올림픽공원', 'forest', 'ㄱ'),
    ],
  },
]

/**
 * 헤더 셀렉터의 라벨 — **원본 문자열 그대로**.
 *   `LocationSelector`: 도시를 잡았으면 도시 UI 이름, 아니면 `현재 위치`
 *   `GenreSelector`: 고른 게 없으면 `모든 장르`, 하나면 그 이름, 둘 이상이면 `{첫 장르} + {n-1}`
 */
const CITY_LABEL = '서울'
const GENRE_LABEL = '모든 장르'

/**
 * 탭 스트립에 걸리는 장르 — **첫 항목만 원본 문자열이고 나머지 넷은 목업**이다.
 * 원본 `GenreSelector` 는 모달이라 화면에 목록이 노출되지 않아 베낄 원본이 없다.
 */
const GENRES = [GENRE_LABEL, '인디', '록', '재즈', '일렉트로닉'] as const

const TABS = [
  { key: 'feed', label: '피드', Icon: House },
  { key: 'events', label: '이벤트', Icon: Tickets },
  { key: 'search', label: '검색', Icon: Search },
  { key: 'my', label: '나의 창꼬', Icon: UserRound },
] as const

/** 탭바 높이 — 마지막 카드가 가리지 않도록 스크롤 아래를 이만큼 비운다. */
const TAB_BAR_HEIGHT = 96
/** 레일 카드 폭 — 원본 `ConcertListItem size="small"` 에 맞춘 고정폭. */
const RAIL_CARD_WIDTH = 132

export default function BilletsFeedPage() {
  const [city] = useState<string>(CITY_LABEL)
  const [genre, setGenre] = useState<string>(GENRE_LABEL)
  const [tab, setTab] = useState<string>('feed')
  const [saved, setSaved] = useState<Set<string>>(new Set(['t2']))
  const scheme = useScheme()

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
      <div className="cm-frame">
        {/*
         * 기기 크롬 — 화면이 아니라 기기다(`screen.css` 「기기 크롬」). 색만 여기서 넣는다:
         * native 스킴이 `light` 하나뿐이라 CSS 변수로 두면 문서 사이트 다크에서 어긋난다.
         */}
        <div className="cm-statusbar" style={{ background: paper.warm, color: scheme.strong }}>
          <span>9:41</span>
          <span className="cm-statusbar-signals">
            <Signal size={16} aria-hidden />
            <Wifi size={16} aria-hidden />
            <BatteryFull size={22} aria-hidden />
          </span>
        </div>

        {/* 여기부터 아래가 앱이다 — 탭바의 `absolute` 기준점이기도 하다. */}
        <div className="cm-screen">
          {/*
           * 바닥을 **여기서** 칠한다 — 프레임(`screen.css`)이 아니라. `.cm-frame` 의 `var(--bg)`
           * 는 문서 사이트의 테마를 따르는데 native 스킴은 `light` 하나뿐이라, 사이트가 다크면
           * 어두운 글자가 어두운 바닥에 얹혀 제목이 통째로 사라진다. RN 앱은 자기 루트를
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
                 *
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

            {/*
             * 장르 스트립 — 원본 `GenreSelector`(모달)를 시안의 **언더라인 탭**으로 이식한 것.
             * 고른 값이 화면에 남아 있는 게 모달보다 낫다는 게 시안의 선택이고, 그 값이
             * 스트립이 되면 라벨 목록이 필요해진다(`GENRES` 주석 참조).
             *
             * 밑줄이 컨테이너 hairline 위에 얹히도록 `marginBottom: -1` 로 1px 겹친다 —
             * 안 겹치면 accent 바 아래에 회색 선이 한 줄 더 생긴다.
             */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                flexGrow: 0,
                backgroundColor: paper.warm,
                borderBottomWidth: 1,
                borderBottomColor: scheme.border,
              }}
              contentContainerStyle={{ gap: nativeSpacing[5], paddingHorizontal: nativeSpacing[4] }}
            >
              {GENRES.map((label) => {
                const active = label === genre
                return (
                  <Pressable
                    key={label}
                    onPress={() => setGenre(label)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    style={{
                      paddingBottom: nativeSpacing[3],
                      marginBottom: -1,
                      borderBottomWidth: 2,
                      borderBottomColor: active ? scheme.accent : 'transparent',
                    }}
                  >
                    <Text
                      size="sm"
                      weight={active ? 'semibold' : 'regular'}
                      tone={active ? 'strong' : 'subtle'}
                    >
                      {label}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            {SECTIONS.map((section) => (
              <View key={section.key} style={{ paddingTop: nativeSpacing[6] }}>
                {/* 제목 블록 — 원본은 전체가 Pressable 이고 누르면 「더보기」로 간다. */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: nativeSpacing[3],
                    paddingHorizontal: nativeSpacing[4],
                  }}
                >
                  <View>
                    {/* subTitle 이 title 위에 온다 — 원본 순서 그대로(작은 회색 줄이 먼저). */}
                    {section.subTitle ? (
                      <Text size="xs" tone="muted">
                        {section.subTitle}
                      </Text>
                    ) : null}
                    <Text size="lg" weight="semibold" tone="strong" style={{ marginTop: 2 }}>
                      {section.title}
                    </Text>
                  </View>
                  {section.more ? (
                    <Text size="xs" tone="subtle">
                      더보기 ›
                    </Text>
                  ) : null}
                </View>

                {/* 가로 레일 — 원본은 horizontal FlatList. */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: nativeSpacing[3],
                    paddingHorizontal: nativeSpacing[4],
                    paddingTop: nativeSpacing[3],
                  }}
                >
                  {section.events.map((event) => (
                    <View key={event.id} style={{ width: RAIL_CARD_WIDTH }}>
                      <ConcertCard
                        tone={event.tone}
                        initial={event.initial}
                        title={event.title}
                        meta={event.date}
                        footer={
                          <Text size="2xs" tone="muted" numberOfLines={1}>
                            {event.venue}
                          </Text>
                        }
                        coverAction={
                          <Pressable
                            onPress={() => toggleSave(event.id)}
                            accessibilityRole="button"
                            accessibilityLabel={saved.has(event.id) ? '담기 취소' : '담기'}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 15,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: saved.has(event.id)
                                ? scheme.accent
                                : 'rgba(0, 0, 0, 0.45)',
                            }}
                          >
                            <Bookmark
                              size={13}
                              color="#fff"
                              fill={saved.has(event.id) ? '#fff' : 'none'}
                              aria-hidden
                            />
                          </Pressable>
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          {/* 탭바 — DS 에 primitive 가 없어 여기서 조립한다. 흡수 판정 근거는 위 주석에. */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: 'row',
              backgroundColor: scheme.surface,
              borderTopWidth: 1,
              borderTopColor: scheme.border,
              paddingTop: nativeSpacing[2],
              paddingBottom: nativeSpacing[6],
            }}
          >
            {TABS.map(({ key, label, Icon }) => {
              const active = tab === key
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    gap: nativeSpacing[1],
                    paddingVertical: nativeSpacing[1],
                  }}
                >
                  {/*
                   * active 를 **색으로** 말한다 — 앞선 판은 굵기(1.6→2.4)만 달라서 지금 어느
                   * 탭에 있는지가 화면에서 읽히지 않았다. 시안이 accent 를 쓰는 세 자리 중 하나.
                   */}
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.6}
                    color={active ? scheme.accent : scheme.subtle}
                    aria-hidden
                  />
                  <Text size="3xs" weight="medium" tone={active ? 'accent' : 'subtle'}>
                    {label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </div>

        <div className="cm-home-indicator" style={{ background: scheme.strong }} />
      </div>
    </View>
  )
}
