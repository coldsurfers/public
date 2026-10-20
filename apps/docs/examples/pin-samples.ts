/** 비율이 제각각인 핀 — 포스터는 인라인 SVG 라 네트워크 없이 그려진다. */
export interface SamplePin {
  id: string
  title: string
  meta: string | null
  poster: string | null
  /** 웹 예제가 높이 추정에 쓰는 비율. native 는 포스터를 받아 잰다. */
  ratio: number | null
}

const svg = (w: number, h: number, hue: number) =>
  // base64 — react-native-web 은 `utf8,` SVG 를 한 번 더 인코딩해 깨뜨린다.
  `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="hsl(${hue} 45% 62%)"/></svg>`,
  )}`

const rows: [string, string | null, number, number, number][] = [
  ['MOBO 인디 뮤직 페스티벌', 'ticketlink.co.kr', 300, 420, 210],
  ['실리카겔 단독 공연 SIREN', 'interpark.com', 300, 300, 20],
  ['성수 레코드 팝업', null, 300, 480, 140],
  ['새소년 전국 투어 — 부산', '@filmlive', 400, 300, 280],
  ['검정치마 TEAM BABY 10주년', 'yes24.com', 300, 400, 330],
  ['홍대 라이브 클럽 데이', null, 300, 360, 60],
]

export const samplePins: SamplePin[] = [
  ...rows.map(([title, meta, w, h, hue], i) => ({
    id: `p${i}`,
    title,
    meta,
    poster: svg(w, h, hue),
    ratio: w / h,
  })),
  { id: 'empty', title: '포스터 없는 핀', meta: '@coldsurf', poster: null, ratio: null },
]
