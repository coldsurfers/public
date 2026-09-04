import { type CoverTone, coverToneFor } from '@coldsurfers/design-system/tokens'

/**
 * 이 화면의 **데이터 경계**. 목업이 사는 자리이자, billets-app 이 목업을 실 API 로 갈아끼울 때
 * 손대는 유일한 파일이다.
 *
 * ## 왜 갈라 냈나
 *
 * 앞선 판은 `page.tsx` 안에 `E('t1', '실리카겔 SIREN', '7.24 금', …)` 같은 줄이 늘어서 있었다.
 * 그리면 되는 시안으로는 충분한데, **이식하려는 순간 그 줄들이 전부 거짓말이 된다** —
 * `7.24 금` 은 API 가 주는 값이 아니라 사람이 미리 접어 둔 결과고, `tone` 과 이니셜은 애초에
 * DTO 에 없는 필드다. 즉 시안이 *이미 변환이 끝난 값*을 들고 있어서, 변환이 어디서 일어나야
 * 하는지가 화면 어디에도 안 적혀 있었다.
 *
 * 그래서 둘로 가른다:
 *   - [`EventDTO`](#) — **원본이 서버에서 받는 모양.** 목업도 이 모양으로 적는다
 *   - [`FeedEvent`](#) — **화면이 읽는 모양.** DTO 에 없는 것은 전부 여기서 파생된다
 *
 * 가운데 [`toFeedEvent`](#) 가 seam 이다. billets-app 은 이 함수만 자기 것으로 바꾸면 되고,
 * 나머지 파일은 한 글자도 안 건드린다. 시안이 "붙는다" 고 주장하려면 **붙는 자리에 이름이
 * 있어야** 한다 — 이 함수가 그 이름이다.
 */

/**
 * `components['schemas']['ConcertDTOSchema']` 중 **이 화면이 실제로 읽는 필드만**.
 * 전부 옮겨 적지 않는 이유는 하나 — 안 읽는 필드를 적으면 그게 계약처럼 보인다.
 *
 * 정본: `surfers-root/apps/billets-app/src/ui/concert-list-item/concert-list-item.tsx` 가
 * 읽는 것과 같다(`id` · `title` · `date` · `mainVenue` · `isSubscribed`).
 */
export interface EventDTO {
  id: string
  /** 상세로 갈 때 쓴다. 없으면 원본은 탭을 무시한다(`if (!item.slug) return`). */
  slug: string
  title: string
  /** ISO. 서버는 UTC 로 주고 표시는 `Asia/Seoul` 이다. */
  date: string
  /** 원본에서 nullable — 공연장 줄이 통째로 빠질 수 있다. */
  mainVenue: { name: string } | null
  isSubscribed: boolean
}

/** 화면이 읽는 모양. `tone` · `initial` · `meta` 는 **DTO 에 없고 파생된다.** */
export interface FeedEvent {
  id: string
  title: string
  /** 카드 둘째 줄. */
  meta: string
  /** 카드 셋째 줄. 공연장이 없으면 빈 문자열이라 카드가 줄을 접는다. */
  venueName: string
  tone: CoverTone
  initial: string
  saved: boolean
}

/**
 * 표시용 날짜 — `7.24 금`.
 *
 * ⚠️ **원본과 다른 유일한 값이고, 그게 이 시안의 판정 하나다.** billets-app 은
 * `dateUtils.parseEventDate` 를 쓰는데 그건 `금요일 오후 7시, 7월 24일` 을 만든다.
 * 레일 카드 폭이 132 라 그 문자열은 **1줄에 들어가지 않는다** — 카드 meta 는
 * `numberOfLines: 1` 이므로 `금요일 오후 7시, 7…` 로 잘린다.
 *
 * 여기서 짧은 형태를 쓰는 건 시안을 예쁘게 만들려는 게 아니라, *어느 포맷이 이 폭에
 * 들어가는가* 를 눈으로 재기 위해서다. **레일에 긴 포맷을 계속 쓸지는 앱의 결정**이고
 * 아직 안 정해졌다 — 정하기 전에는 이 함수가 그 결정이 열려 있다는 표시다.
 */
const KST_DATE = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
})

function formatEventDate(iso: string): string {
  const parts = new Map(KST_DATE.formatToParts(new Date(iso)).map((p) => [p.type, p.value]))
  return `${parts.get('month')}.${parts.get('day')} ${parts.get('weekday')}`
}

/**
 * DTO → 화면. **파생 규칙이 여기 한 곳에만 있다.**
 *
 * `tone` 은 손으로 고르지 않는다 — DS 가 발행하는 `coverToneFor(id)` 가 팔레트에서
 * 결정적으로 뽑는다. web-next 도 같은 함수를 쓰므로 두 표면의 톤 분산이 *같은 소스*에서
 * 나온다. 앞선 판처럼 목업에 `tone` 을 적어 두면 그 순간 소스가 둘이 되고, 실 데이터로
 * 갈아끼울 때 누가 톤을 정하는지가 다시 열린 질문이 된다.
 *
 * `initial` 은 제목 첫 글자다. 포스터가 붙으면(`posterUrl`) 카드가 이니셜을 안 그리므로
 * 이 값은 포스터 없는 이벤트에서만 보인다.
 */
export function toFeedEvent(dto: EventDTO): FeedEvent {
  return {
    id: dto.id,
    title: dto.title,
    meta: formatEventDate(dto.date),
    venueName: dto.mainVenue?.name ?? '',
    tone: coverToneFor(dto.id),
    initial: dto.title.slice(0, 1),
    saved: dto.isSubscribed,
  }
}

/**
 * 섹션 하나 = 원본의 `FeedHorizontalEvents.List` 한 벌 = **쿼리 하나**.
 *
 * 섹션끼리 이벤트를 공유하지 않는다. 원본에서 다섯 섹션은 각자 다른 엔드포인트를 물기
 * 때문이다(`trending` · `newEvents` · `tonightEvents` · `recent` · `allList`) — 공통 풀에서
 * 잘라 쓰면 목업이 실제보다 단순해지고, 그 단순함이 화면에 안 보인다.
 */
export interface FeedSectionData {
  key: string
  title: string
  subTitle?: string
  /** 원본에서 `onPressMore` 가 걸린 섹션만 `true`. 걸리면 제목 줄에 「모두 표시」가 뜬다. */
  more: boolean
  events: EventDTO[]
}

const event = (
  id: string,
  slug: string,
  title: string,
  date: string,
  venueName: string | null,
  isSubscribed = false,
): EventDTO => ({
  id,
  slug,
  title,
  date,
  mainVenue: venueName ? { name: venueName } : null,
  isSubscribed,
})

/**
 * 장르를 안 골랐을 때의 피드 — 원본 `feed-main-screen.tsx` 의 `sections` 순서 그대로.
 *
 * 제목 · 부제 · 「모두 표시」 유무는 **전부 원본 문자열이 정본**이다. 각 값의 출처:
 *   `서울 지역 인기 공연`  `feed-trending-events.tsx` (도시를 잡았을 때의 형태)
 *   `최근 추가된 공연`     `feed-new-events.tsx`      — `onPressMore` 있음
 *   `오늘 저녁 예정된 공연` `feed-tonight-events.tsx`  — `onPressMore` 있음
 *   `최근에 확인한 공연`    `feed-recently-viewed-events.tsx`
 *   `모든 이벤트`          `feed-all-events.tsx`      — `onPressMore` 있음
 */
const DEFAULT_FEED: FeedSectionData[] = [
  {
    key: 'trending',
    title: '서울 지역 인기 공연',
    subTitle: '인기 상승 중인 공연',
    more: false,
    events: [
      event('t1', 'silica-gel-siren', '실리카겔 SIREN', '2026-07-24T10:00:00Z', '무신사 개러지'),
      event('t2', 'hyukoh-sunset', 'HYUKOH & 落日飛車', '2026-07-26T09:00:00Z', '올림픽공원', true),
      event('t3', 'jannabi-solo', '잔나비 단독 콘서트', '2026-08-09T09:00:00Z', '롤링홀'),
      event('t4', 'parannoul-band', 'Parannoul 밴드셋', '2026-08-15T10:00:00Z', '벨로주 홍대'),
    ],
  },
  {
    key: 'new',
    title: '최근 추가된 공연',
    subTitle: '매일 오후 업데이트됩니다',
    more: true,
    events: [
      event(
        'n1',
        'the-black-skirts',
        '검정치마 전국투어',
        '2026-09-05T10:00:00Z',
        'YES24 라이브홀',
      ),
      event('n2', 'se-so-neon-summer', '새소년 여름 투어', '2026-08-23T09:00:00Z', 'KT&G 상상마당'),
      event('n3', 'kadejo-solo', '까데호 단독', '2026-09-13T09:00:00Z', '무신사 개러지'),
    ],
  },
  {
    key: 'tonight',
    title: '오늘 저녁 예정된 공연',
    subTitle: '매일 오후 업데이트됩니다',
    more: true,
    events: [
      event('g1', 'irish-night', '아일리쉬 나잇', '2026-09-04T10:00:00Z', '클럽 FF'),
      event(
        'g2',
        'drone-session-4',
        'Drone Session vol.4',
        '2026-09-04T11:00:00Z',
        '스트레인지프룻',
      ),
    ],
  },
  {
    key: 'recent',
    title: '최근에 확인한 공연',
    more: false,
    events: [
      event('r1', 'kebiishi-kr', '検非違使 내한공연', '2026-08-02T09:00:00Z', '웨스트브릿지'),
      event('r2', 'silica-gel-siren', '실리카겔 SIREN', '2026-07-24T10:00:00Z', '무신사 개러지'),
    ],
  },
  {
    key: 'all',
    title: '모든 이벤트',
    more: true,
    events: [
      event(
        'a1',
        'pentaport-2026',
        '펜타포트 락 페스티벌',
        '2026-08-01T02:00:00Z',
        '송도 달빛축제공원',
      ),
      event(
        'a2',
        'slow-life-slow-live',
        '슬로우 라이프 슬로우 라이브',
        '2026-09-20T02:00:00Z',
        '올림픽공원',
      ),
      // 공연장이 아직 안 잡힌 이벤트 — `mainVenue` 가 null 인 경우가 실제로 온다.
      event('a3', 'grand-mint-festival', '그랜드 민트 페스티벌', '2026-10-18T02:00:00Z', null),
    ],
  },
]

/**
 * 장르 — **API 가 쓰는 이름(`name`)과 사람이 읽는 이름(`uiName`)이 다르다.**
 * 표의 정본은 `surfers-root/packages/shared-utils` 의 `eventCategoryUtils.getEventCategoryUIName`
 * 이고, 전체는 7종(`Gigs` · `Theatre` · `Dance` · `Korean-Traditional` · `Classic` · `Party` ·
 * `Dj`)이다. 여기 넷은 **목록을 줄인 것**이지 이름을 지어낸 게 아니다 —
 * 앞선 판의 `인디` · `록` · `재즈` · `일렉트로닉` 은 이 앱에 존재하지 않는 어휘였다.
 */
export interface Genre {
  name: string
  uiName: string
}

/** 아무것도 안 고른 상태. 원본 `GenreSelector` 가 이 문자열을 쓴다(`selectedGenres.length === 0`). */
export const ALL_GENRES: Genre = { name: '', uiName: '모든 장르' }

export const GENRES: Genre[] = [
  ALL_GENRES,
  { name: 'Gigs', uiName: '콘서트' },
  { name: 'Theatre', uiName: '연극 / 뮤지컬' },
  { name: 'Classic', uiName: '클래식' },
  { name: 'Dj', uiName: '디제잉' },
]

/**
 * 장르를 골랐을 때 오는 것 — `browseEvents({ eventCategoryName })` 한 벌.
 * 제목은 장르 UI 이름 그대로고 **부제도 「모두 표시」도 없다**(`feed-genre-events.tsx`).
 */
const GENRE_FEED: Record<string, EventDTO[]> = {
  Gigs: [
    event('c1', 'wave-to-earth-seoul', 'wave to earth 서울', '2026-10-03T10:00:00Z', '올림픽홀'),
    event('c2', 'silica-gel-siren', '실리카겔 SIREN', '2026-07-24T10:00:00Z', '무신사 개러지'),
    event('c3', 'adoy-live', 'ADOY 단독 공연', '2026-11-14T10:00:00Z', '무신사 개러지'),
  ],
  Theatre: [
    event('h1', 'sweeney-todd', '스위니 토드', '2026-09-12T10:30:00Z', '샤롯데씨어터'),
    event('h2', 'the-nether', '더 네더', '2026-10-08T11:00:00Z', '두산아트센터'),
  ],
  Classic: [
    event('l1', 'kbs-so-brahms', 'KBS교향악단 브람스 4번', '2026-09-26T10:30:00Z', '예술의전당'),
    event('l2', 'cho-seong-jin-recital', '조성진 리사이틀', '2026-12-05T10:00:00Z', '롯데콘서트홀'),
    event('l3', 'seoul-phil-mahler', '서울시향 말러 2번', '2026-11-21T10:30:00Z', '예술의전당'),
  ],
  Dj: [
    event('d1', 'faust-open-air', 'FAUST Open Air', '2026-09-19T13:00:00Z', '파우스트'),
    event('d2', 'cakeshop-anniversary', 'Cakeshop 12th Anniversary', '2026-10-31T14:00:00Z', null),
  ],
}

/**
 * 화면이 그릴 섹션 목록 — **장르가 피드를 통째로 바꾼다.**
 *
 * 원본 `feed-main-screen.tsx` 의 `renderItem` 이 하는 판정 그대로다:
 * `selectedGenres.length === 0` 이면 다섯 섹션, 아니면 고른 장르마다 섹션 하나
 * (`FeedGenreEventsSet`). 앞선 판은 스트립이 값만 바꾸고 피드는 그대로였는데,
 * 그러면 **화면에서 가장 큰 상태 변화가 시안에 안 들어 있게** 된다.
 */
export function feedFor(genre: Genre): FeedSectionData[] {
  if (genre.name === ALL_GENRES.name) return DEFAULT_FEED

  const events = GENRE_FEED[genre.name] ?? []
  // 원본은 0건이면 섹션을 통째로 접는다(`if (isFetched && items.length === 0) return null`).
  // 고른 장르가 그 하나뿐이면 **화면이 통째로 빈다** — 빈 상태 화면이 없다는 뜻이고,
  // 이건 리스킨의 결함이 아니라 원본이 아직 안 정한 자리다.
  if (events.length === 0) return []

  return [{ key: `genre-${genre.name}`, title: genre.uiName, more: false, events }]
}
