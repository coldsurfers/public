# @coldsurfers/shared-utils

COLDSURF 표면들(web · server · native)이 나눠 쓰는 순수 유틸.

렌더링이 없다 — 프레임워크·DOM 에 기대지 않는 함수만 담는다.

## 설치

```sh
pnpm add @coldsurfers/shared-utils
```

`/date` · `/slug` 를 쓸 거면 **날짜 라이브러리를 같이 설치한다.**

```sh
pnpm add date-fns date-fns-tz
```

둘은 **optional peer** 다 — 안 쓰는 소비처에 38MB(`date-fns` 실측)를 얹지 않으려고 그렇게 뒀다
(`design-system` 이 `react-native`·`@emotion/*` 을 다루는 방식과 같다).

⚠️ optional 이라 **빠져 있어도 설치 경고가 없다.** `/date` 를 import 하는 순간 런타임에서
모듈을 못 찾는 걸로 처음 드러난다. 새 진입점이 무거운 의존을 물면 같은 규칙을 따른다.

## 진입점

**루트 배럴이 없다.** `모듈 하나 = 파일 하나 = 진입점 하나` 이고 예외가 없다.

```ts
import { dateUtils } from '@coldsurfers/shared-utils/date'
import { normalizeEmail } from '@coldsurfers/shared-utils/email'
```

`import … from '@coldsurfers/shared-utils'` 는 **에러다** (`ERR_PACKAGE_PATH_NOT_EXPORTED`).
어느 유틸이 배럴에 있고 어느 게 없는지 기억할 일이 없게 하려고 그렇게 뒀다 — 이유는 아래
[왜 배럴이 없나](#왜-배럴이-없나).

| 진입점 | 내용 | 추가 설치 |
| --- | --- | --- |
| `/constants` | `SERVICE_NAME` · `COLDSURF_WEB_URL` · `APP_STORE_*` · `PLAYSTORE_*` · `SNS_LINKS` | — |
| `/date` | KST 사람 표기 · UTC 일/주말 경계 | `date-fns` `date-fns-tz` |
| `/email` | `normalizeEmail` — `+alias` 를 걷어낸 이메일 신원 | — |
| `/event-category` | `eventCategoryUtils` — `Gigs` → `콘서트` | — |
| `/kopis-price` | `kopisPriceUtils` — KOPIS 비정형 `price` → 좌석별 가격표 | — |
| `/location-city` | `locationCityUtils` — `seoul` → `서울` | — |
| `/number` | `getRandomInt` | — |
| `/parser` | `tryParse` — throw 하지 않는 `JSON.parse` | — |
| `/slug` | URL 슬러그 · 공연 슬러그 · 해시태그 · 중복 회피 | `date-fns` `slugify`\* |
| `/uri` | `fullyDecodeURI` · `fullyDecodePathname` · `isEncoded` · `isDoubleEncoded` | — |
| `/uuid` | `generateUUID` — `crypto.randomUUID` 없는 환경까지 | — |

\* `slugify` 는 이 패키지의 일반 `dependency` 라 저절로 따라온다. 직접 설치할 건 `date-fns` 뿐.

### 알아둘 것

- **`normalizeEmail` 은 dot 을 건드리지 않는다.** Gmail 은 dot 을 무시하지만 다른 프로바이더는
  실제로 다른 주소로 구분하는 경우가 있어, 일괄 제거는 서로 다른 사람을 한 계정으로 합칠 위험이 있다.
- **`kopisPriceUtils.parse` 는 fail-open** — throw 하지 않는다. 해석 불가면 `[]` 다.
- **`tryParse` 의 기본 타입 인자는 `unknown`** 이다. 형태를 아는 쪽이 `tryParse<Config>(raw)` 로 선언한다.
- **`generateUUID` 는 암호학적 난수가 아니다.** 토큰·키에 쓰지 않는다.
- **`generateSlug` 계열은 확인과 사용 사이에 경합이 있다.** 유일성이 중요한 곳은 저장 시점의
  unique 제약이 정본이다.
- **`getSafeSlug` 는 `createSlug` 와 제거 문자 집합이 다르다.** 이미 발급된 URL 호환 때문에
  통일하지 않는다.
- ⚠️ **`getWeekendUTCStartDates` 의 기준일은 "속한 주"가 아니라 이후 첫 금요일이다**
  (`diffToFriday = (5 - baseDay + 7) % 7`). 토·일을 넣으면 그 주말이 아니라 **다음 주말**이 나온다.
  그 주말을 원하면 호출부가 기준일을 금요일로 먼저 정규화해야 한다.


## 왜 배럴이 없나

배럴을 두면 **무엇을 올릴지**를 정해야 하는데, 그 기준이 결국 둘로 수렴한다.

1. **DOM·React 를 무는가** — 무는 순간 배럴 한 줄이 DOM lib 없이 도는 소비자(Fastify 서버 등)의
   타입체크를 깬다. 그 유틸을 쓰는지와 무관하게.
2. **무거운 의존을 무는가** — 무는 순간 그 유틸을 안 쓰는 소비자도 설치해야 한다.
   번들러가 털어주지 않는다: **해소가 tree-shaking 보다 먼저**라, 설치 안 된 모듈은 그래프를
   만드는 단계에서 죽는다. `sideEffects: false` 도 external 도 이걸 못 막는다.

둘 다 **모듈 내부 사정**이다. 그걸 배럴 소속에 연결하면 유틸이 의존을 하나 무는 순간 배럴에서
빠져야 하고, 그건 major breaking 이 된다. 진입점만 있으면 그 이동이 아예 없다 — 모듈이 무엇을
물든 공개 경로가 안 바뀐다.

## 새 유틸을 더할 때

`src/<모듈>.ts` 파일 하나를 만들면 된다. 그리고 `package.json` 의 `exports` 에 한 항목:

```json
"./<모듈>": { "types": "./dist/<모듈>.d.ts", "default": "./dist/<모듈>.js" }
```

빌드 진입점은 `exports` 에서 파생되므로 `vite.config.ts` 는 건드릴 게 없다. `exports` 갱신을
잊으면 `pnpm check:exports` 가 실패한다 — 안 그러면 빌드·타입체크·테스트를 다 통과한 채로
**그 유틸만 조용히 발행에서 빠진다.**

⚠️ 무거운 의존을 물면 `peerDependenciesMeta` 에 `optional: true` 로 단다. optional 이라
**빠져 있어도 설치 경고가 없어서**, 그 진입점을 import 하는 순간 해소 실패로 처음 드러난다.
README 표의 "추가 설치" 칸이 그걸 알리는 유일한 자리다.

파일 이름은 평평하게(`dist/date.js`) — `dist/date/index` 처럼 중첩하면 `rollupTypes` 가 그
엔트리에 안 먹어 `.d.ts` 에 소스 트리 경로가 남는다.
