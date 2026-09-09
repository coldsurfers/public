import { z } from 'zod'

export const LocationCountryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  uiName: z.string(),
  cities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      uiName: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
  ),
})
export type LocationCountryDTO = z.infer<typeof LocationCountryDTOSchema>

export const LocationCityDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  uiName: z.string(),
  lat: z.number(),
  lng: z.number(),
  geohash: z.string().nullable(),
})
export type LocationCityDTO = z.infer<typeof LocationCityDTOSchema>

// ─── 지역 건수 (`GET /v2/locations`) ─────────────────────────────────────────
//
// `/v2/genres` 의 대칭 축이다 — 어휘가 아니라 **재고 관측**을 준다. `/v1/location/city` 가
// 도시 *행* 을 주는 것과 다르다: 저건 upcoming 공연이 0건인 도시(오사카·호치민)도 그대로 주므로
// "누르면 결과가 있는 칩" 을 만들 수 없다. 여기선 건수를 같이 줘서 소비자가 0건을 접을 수 있다.
//
// KO 표기는 안 싣는다 — `locationCityUtils.getLocationCityUIName(city)` 가 이미 정본이고,
// `LocationCity.uiName` 은 영문(`Seoul`·`Gyeonggi-do`)이라 화면 라벨로 쓸 수 없다.

/** `city` 는 `LocationCity.name`(lowercase, URL 세그먼트 그대로). */
export const LocationCountDTOSchema = z.object({
  city: z.string(),
  count: z.number(),
})
export type LocationCountDTO = z.infer<typeof LocationCountDTOSchema>

export const LocationCountListDTOSchema = LocationCountDTOSchema.array()
export type LocationCountListDTO = z.infer<typeof LocationCountListDTOSchema>

// 두 소비자가 같은 영역 검색을 서로 다른 목적으로 쓴다:
//   - 지도(billets-app) — 뷰포트 안 **전부** 가 필요하다(핀을 누적 클러스터링하므로 자르면 핀이 사라진다).
//   - `/nearby`(web-next) — **가까운 것 몇 개** 만 필요하다(거리 밴드 레일 3개).
// 그래서 정렬축·건수를 쿼리로 갈랐다. 둘 다 optional 이고 기본값이 기존 동작(date asc · 사실상 전량)이라
// 파라미터를 안 보내는 구버전 앱은 영향 없다.
export const GetLocationConcertsQueryStringDTOSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  latitudeDelta: z.coerce.number(),
  longitudeDelta: z.coerce.number(),
  zoomLevel: z.coerce.number(),
  /** `distance` 는 원점(latitude·longitude) 기준 거리 오름차순. `size` 와 함께 써야 의미가 있다. */
  sort: z.enum(['date', 'distance']).default('date'),
  /**
   * 상한 2000 — 지도 소비자를 자르지 않으려는 값이다. 서울 광역 뷰포트 실측이 ~1100건이라 2배 여유.
   * ⚠️ upcoming 재고가 2000 을 넘기면 그날부터 지도 핀이 조용히 잘린다.
   */
  size: z.coerce.number().int().min(1).max(2000).default(2000),
})
export type GetLocationConcertsQueryStringDTO = z.infer<
  typeof GetLocationConcertsQueryStringDTOSchema
>
