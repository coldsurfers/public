'use client'

import { Button, ConcertCard, Text, useScheme } from '@coldsurfers/design-system/native'
import type { CoverTone } from '@coldsurfers/design-system/tokens'
import { nativeSpacing } from '@coldsurfers/design-system/tokens/native'
import { Bookmark, House, MapPin, Search, Tickets, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
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
 *   - 폰 프레임(`screen.css`) — 화면이 아니라 화면을 담는 상자다
 *   - 아이콘(`lucide-react`) — 실제 RN 은 `lucide-react-native` 로 바꾼다. 이름·props 가 같아
 *     import 한 줄이고, RNW 에선 web 판이 그대로 그려져 시안 판정엔 지장이 없다
 *
 * ## 매핑
 *
 * | billets-app | COLDSURF DS |
 * | --- | --- |
 * | `ConcertListItem size="small"` (레일 카드) | `native/ConcertCard` |
 * | `ConcertSubscribeButton` (커버 오버레이) | `ConcertCard` 의 `coverAction` 슬롯 |
 * | `LocationSelector` · `GenreSelector` | `native/Button variant="outline" size="sm"` |
 * | `NavigationHeader.Brand` 브랜드 줄 | **없음** — 로고 + 워드마크로 조립 |
 * | `FeedHorizontalEvents` 제목 블록 · 레일 | **없음** — 여기서 조립 |
 * | `TabBar` | **없음** — 여기서 조립 |
 *
 * 워딩은 원본 문자열 그대로다 — `COLDSURF` · 도시명 · `모든 장르` · 섹션 제목 5벌.
 * 셀렉터 둘은 원본이 흰 배경 + shadow 의 rounded-8 버튼인데, DS 에 그 그림자 어휘가 없어
 * `outline`(흰 배경 + 테두리)로 옮겼다. 리스킨은 값을 베끼는 게 아니라 어휘를 갈아끼우는 것이다.
 *
 * `reserveTitleLines` 는 **끈다** — `ConcertCard` 주석이 정한 규율 그대로다. 예약은 그리드의
 * 것이고, 가로 레일은 1줄 제목 기준이라 예약하면 제목 아래 빈 줄이 생긴다.
 *
 * ## P3 흡수 판정 (AGENTS.md 「무엇을 여기로 옮기는가」)
 *
 * - **`FeedHorizontalEvents`(제목 + 레일) → 흡수 후보 1순위.** 셋을 전부 밀어낼 수 있고
 *   (title · subTitle · onPressMore · children), web-next 의 트렌딩 레일이 이미 같은 모양이다 —
 *   **두 번째 소비처가 이미 있다.** 규칙상 옮길 조건을 만족한다.
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
  const [genreLabel] = useState<string>(GENRE_LABEL)
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
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
          showsVerticalScrollIndicator={false}
        >
          {/* 원본 `NavigationHeader` — 브랜드 줄 + `navigationComponent` 슬롯 두 줄. */}
          <View
            style={{
              backgroundColor: scheme.bg,
              borderBottomWidth: 1,
              borderBottomColor: scheme.border,
              paddingHorizontal: nativeSpacing[4],
              paddingTop: nativeSpacing[4],
              paddingBottom: nativeSpacing[3],
              gap: nativeSpacing[3],
            }}
          >
            {/* 원본 `NavigationHeader.Brand` — 로고 40 원형 + `COLDSURF`. */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={{ uri: 'https://coldsurf.io/logo.png' }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
              {/*
               * 원본은 bold 22. DS 의 fontWeight 축은 300·400·500·600 넷이라 bold 가 없고
               * 22px 도 스케일에 없어(xl=20 · 2xl=24) 가장 가까운 `xl` + `semibold` 로 앉힌다.
               * 리스킨은 원본 값을 베끼는 게 아니라 **DS 어휘로 다시 말하는 것**이다.
               */}
              <Text size="xl" weight="semibold" tone="strong">
                COLDSURF
              </Text>
            </View>

            {/* 아랫줄 — 셀렉터 둘이 왼쪽 정렬로 나란히 선다. */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: nativeSpacing[2] }}>
              {/* LocationSelector — 누르면 `LocationSelectorModal`. 위치를 못 잡으면 `현재 위치`. */}
              <Button variant="outline" size="sm">
                {/*
                 * 웹 `Button` 은 `<MapPin/>{city}` 를 그냥 받는데 **여기선 못 받는다** —
                 * RN 은 텍스트 스타일이 상속되지 않아 라벨을 `Text` 로 감싸야 한다.
                 * Root 가 이미 row + gap 이라 조각 둘을 그대로 넘기면 된다.
                 */}
                <MapPin size={16} color={scheme.strong} aria-hidden />
                <Text size="sm" tone="strong">
                  {city}
                </Text>
              </Button>
              {/* GenreSelector — 누르면 `GenreSelectionScreen`. 고른 게 없으면 `모든 장르`. */}
              <Button variant="outline" size="sm">
                {genreLabel}
              </Button>
            </View>
          </View>

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
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.6}
                  color={active ? scheme.strong : scheme.subtle}
                  aria-hidden
                />
                <Text size="3xs" weight="medium" tone={active ? 'strong' : 'subtle'}>
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </div>
    </View>
  )
}
