# @coldsurfers/shared-utils

COLDSURF 표면들(web · server · native)이 나눠 쓰는 순수 유틸.

렌더링이 없다 — 프레임워크·DOM 에 기대지 않는 함수만 담는다.

## 설치

```sh
pnpm add @coldsurfers/shared-utils
```

`date-fns`·`date-fns-tz` 는 번들에 들어가지 않으니 소비처에도 설치돼 있어야 한다.

## 진입점

| 경로 | 내용 |
| --- | --- |
| `@coldsurfers/shared-utils` | 환경 중립 유틸 전부 (루트 배럴) |
| `@coldsurfers/shared-utils/date` | 날짜 — KST 포맷·UTC 범위 |

```ts
import { dateUtils } from '@coldsurfers/shared-utils/date'

dateUtils.parseEventDate(new Date('2025-03-15T05:00:00Z'))
// '토요일 오후 2시, 3월 15일'
```

### `dateUtils`

| 함수 | 하는 일 |
| --- | --- |
| `parseEventDate(date, options?)` | UTC Date → KST 한국어/영어 사람 표기. 해가 다르면 연도를 붙이고, 정각이면 분을 뗀다 |
| `toUTCDayRangeFromYYYYMMDD({ yyyymmdd })` | `20250101` → 그 날 KST 00:00~24:00 의 UTC 경계 `[start, end]` |
| `getWeekendUTCStartDates({ yyyymmdd? })` | 기준일 **이후 첫 금요일**부터 금·토·일 세 구간의 UTC 경계 |

⚠️ `getWeekendUTCStartDates` 의 기준일은 "속한 주"가 아니라 **이후 첫 금요일**이다
(`diffToFriday = (5 - baseDay + 7) % 7`). 토·일을 넣으면 그 주말이 아니라 **다음 주말**이 나온다.
호출부에서 그 주말을 원하면 기준일을 금요일로 먼저 정규화해야 한다.

## 새 유틸을 더할 때

⚠️ **루트 배럴(`src/index.ts`)에 DOM·React·Next 를 무는 유틸을 올리지 않는다.** 올리는 순간
DOM lib 없이 도는 소비자(Fastify 서버 등)의 타입체크가 그 유틸을 쓰지 않아도 깨진다.
그런 유틸은 진입점을 갈라 서브패스로만 연다 — `vite.config.ts` 의 `entry` 에 한 줄,
`package.json` 의 `exports` 에 한 줄.

파일 이름은 평평하게(`dist/date.js`), 공개 경로만 중첩으로(`./date`).
