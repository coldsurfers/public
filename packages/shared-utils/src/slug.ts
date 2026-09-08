import { format } from 'date-fns'
import slugify from 'slugify'

/**
 * 슬러그 만들기 전에 기호를 읽을 수 있는 단어로 바꾼다.
 *
 * `slugify` 는 이것들을 그냥 지우기 때문에 "Rock & Roll" 과 "Rock Roll" 이 같은 슬러그가 된다.
 */
const replacements = [
  [/#/g, 'no'],
  [/&/g, 'and'],
  [/%/g, 'percent'],
] as const

function preprocess(title: string) {
  return replacements.reduce((acc, [regex, value]) => acc.replace(regex, value), title)
}

/** 공통 `slugify` 옵션 — 구분자만 다르다. */
const SLUGIFY_BASE = {
  lower: true,
  strict: false,
  remove: /[/[\]*+~.()'"?!:@,<>〈〉]/g,
} as const

/**
 * 임의 문자열 → URL 슬러그.
 *
 * `strict: false` 인 이유: 한글을 남긴다. COLDSURF 의 URL 은 한국어 공연명을 그대로 담는다.
 */
export const createSlug = (valueToSlugify: string) =>
  slugify(preprocess(`${valueToSlugify}`), { ...SLUGIFY_BASE, replacement: '-' })

/** SNS 해시태그용 — 하이픈 대신 언더스코어. 해시태그는 `-` 에서 끊긴다. */
export const createSlugHashtag = (valueToSlugify: string) =>
  slugify(preprocess(`${valueToSlugify}`), { ...SLUGIFY_BASE, replacement: '_' })

/**
 * `createSlug` 와 제거 문자 집합이 다르다 — 여기엔 `&`·`#` 이 없고 `/` 를 남긴다.
 *
 * 이미 발급된 슬러그와의 호환 때문에 통일하지 않는다. 규칙을 합치면 기존 URL 이 바뀐다.
 */
export const getSafeSlug = (slug: string) =>
  slugify(slug, {
    replacement: '-',
    lower: true,
    strict: false,
    remove: /[[\]*+~.()'"?!:@,&<>〈〉#]/g,
  })

/** 영어 서수 접미사 — 4~20 은 예외 없이 `th`. */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

/** `2025-10-03` → `3rd-oct`. 슬러그 안에서 사람이 읽을 수 있는 날짜 조각. */
function formatDateSlug(date: Date): string {
  const day = Number(format(date, 'd'))
  const month = format(date, 'MMM').toLowerCase()
  return `${day}${getOrdinalSuffix(day)}-${month}`
}

/** 공연 슬러그 — 제목 + 날짜 + (공연장) + (지역) + "티켓". */
export const createConcertSlug = ({
  title,
  date,
  venueName,
  area,
}: {
  title: string
  date: Date
  venueName?: string
  area?: string
}) => {
  let value = `${title}-${formatDateSlug(date)}`
  if (venueName) {
    value += `-${venueName}`
  }
  if (area) {
    value += `-${area}`
  }
  value += '-티켓'
  return slugify(preprocess(value), { ...SLUGIFY_BASE, replacement: '-' })
}

/**
 * 이미 쓰이는 슬러그면 `-1`, `-2` … 를 붙여 비어 있는 것을 찾는다.
 *
 * 중복 판정은 호출부가 넘긴 `existingCallback` 이 한다 — 이 패키지는 저장소를 모른다.
 * ⚠️ 확인과 사용 사이에 경합이 있다. 유일성이 중요한 곳은 저장 시점의 unique 제약이 정본이다.
 */
async function withUniqueSuffix(
  base: string,
  existingCallback: (newSlug: string) => boolean | Promise<boolean>,
) {
  if (!(await existingCallback(base))) {
    return base
  }
  let counter = 1
  let candidate = `${base}-${counter}`
  while (await existingCallback(candidate)) {
    counter++
    candidate = `${base}-${counter}`
  }
  return candidate
}

export const generateSlug = (
  title: string,
  existingCallback: (newSlug: string) => boolean | Promise<boolean>,
) => withUniqueSuffix(createSlug(title), existingCallback)

export const generateConcertSlug = (
  params: Parameters<typeof createConcertSlug>[0],
  existingCallback: (newSlug: string) => boolean | Promise<boolean>,
) => withUniqueSuffix(createConcertSlug(params), existingCallback)
