# 웹 컴포넌트를 native 레인으로 옮기기

`src/primitives`·`src/cards` 의 웹 컴포넌트를 `src/native` 로 옮기는 절차.

**자동 변환은 없다.** 웹은 vanilla-extract 라 산출물이 CSS 파일 + 클래스 이름인데 RN 엔 그 둘을
받을 곳이 없다. 그래서 옮기는 건 **번역이 아니라 스타일만 다시 쓰기**다 — 구조·로직·props 는
그대로 복사되고, `.css.ts` 한 파일만 `styled` 로 다시 쓴다.

`ConcertCard`(`bare`) 로 재보니 이 비율이다: 구조 137줄은 거의 그대로, CSS 296줄 중 `bare`
블록만 ~90줄 → RN 스타일 ~60줄. 실제 판단이 필요한 건 아래 표의 5줄뿐이었다.

**옮기는 것으로 끝나지 않는다.** 같은 숫자가 두 파일에 남으므로 마지막에 `src/contract/` 로
묶어야 포팅이 완료된다 — 「계약」 절.

## 절차

1. **웹 파일 둘을 읽는다** — `X.tsx`(구조)와 `X.css.ts`(스타일)
2. **`native/X.tsx` 를 만든다.** props interface 는 **이름·의미를 그대로 복사**한다.
   못 옮긴 축은 *좁혀서* 옮긴다 — prop 을 아예 두지 않는다. 있는데 안 먹는 prop 은 거짓말을 한다
3. **스타일을 `@emotion/native` 로 다시 쓴다.** 값은 웹과 **같아야 한다** — 리스킨이 아니라
   같은 시안을 다른 문법으로 쓰는 것이라, 값이 갈리면 버그다
4. **계약을 `src/contract/` 에 올린다** — 아래 「계약」. **이 단계를 건너뛰면 포팅이 끝난 게
   아니다.** 값이 같은 건 방금 옮겼기 때문일 뿐, 다음 사람이 한쪽만 고치면 조용히 갈린다
5. **배럴과 진입점 둘 다 등록한다** — `native/index.ts` 에 export, `vite.config.ts` 의
   `lib.entry` 에 `'native-X'`, `package.json` 의 `exports` 에 `./native/X`.
   왜 셋인지는 아래 「소비」. 그리고 `pnpm changeset` 을 남긴다
6. **`apps/docs/app/playground` 에서 눈으로 본다** (아래 「배선」)

## 무엇이 기계적이고 무엇이 판단인가

| 웹 | RN | |
| --- | --- | --- |
| `lineClamp(n)` | `numberOfLines={n}` | 기계적 |
| `aspectRatio: '4 / 3'` | `aspectRatio: 4 / 3` | 기계적 — RN 이 그대로 지원 |
| `inset: 0` | `top/right/bottom/left: 0` | 기계적 |
| `gap`·`flexDirection`·`borderRadius` | 같음 | 기계적 |
| `@media(tablet)` | **없음** | **판단** — 어느 쪽 값을 남길지. 이 레인의 표면은 폰이라 보통 모바일 값 |
| `alpha(c, 20)` (`color-mix`) | `opacity: 0.2` | **판단** — 노드 전체가 옅어져도 되는가 |
| `transition` | `Animated` or 삭제 | **판단** — 대개 삭제. 누름 피드백은 `Pressable` 이 이미 준다 |
| `linear-gradient` | 라이브러리 필요 | **판단** — `expo-linear-gradient` 를 물릴 값을 하는가 |
| `:hover` | 없음 | 해당 없음 — DS 카드엔 한 번도 안 쓴다 |

## 옮기다 드러난 계약 차이 둘

**`className` 자리가 사라진다.** 웹은 소비처가 `className` 으로 폭·여백을 덮었다
(`.bh-events > * { width: 132px }`). RN 엔 그 자리가 없어 소비처가 **래핑 `View`** 로 폭을 준다.
카드가 자기 폭을 모른다는 계약은 같고, 주는 방법만 바뀐다.

**웹 `Button` 은 `<Icon/>{'서울'}` 을 받는데 RN 은 못 받는다.** 웹은 CSS 가 텍스트 스타일을
상속시키지만 RN 은 안 한다 — 문자열을 `<Text>` 로 감싸야 한다. `Button` 의 Root 가 이미
row + gap 이라 조각 둘을 그냥 넘기면 되지만, **호출부 코드가 갈리는 지점**이라 계약을 옮길 때
같이 적어야 한다.

## 계약 — 옮긴 뒤 반드시 하는 것

포팅이 끝나면 같은 숫자가 **두 파일에 손으로 적혀 있다.** 그 상태를 그대로 두면 갈린다.
`Toast` 가 그 증거다 — padding·fontSize·dot height 가 이미 다르고, 의도인지 사고인지
코드로 구분되지 않는다(`contract/toast.ts`).

**안 갈렸을 때 묶어야 안 갈린다.** 갈린 뒤엔 어느 쪽이 정본인지 사람이 먼저 정해야 한다.

### 두 층으로 올린다

`src/contract/<component>.ts` 를 만들고 `contract/index.ts` 에서 재수출한다.

| 층 | 무엇 | 예 |
| --- | --- | --- |
| **타입** | variant·size 유니온 축 | `ConcertCardVariant` |
| **props** | 두 구현이 글자 그대로 같은 prop 묶음 | `ConcertCardBareProps` |
| **값** | 축 → 치수 표 | `CONCERT_CARD_BARE_SPEC` |

그다음 **양쪽이 그 표를 읽게** 한다 — 웹은 `.css.ts` 에서, native 는 `styled` 객체에서.
`.css.ts` 는 빌드 타임에 평가되므로 평범한 TS 상수를 그냥 import 하면 된다.

```ts
// contract/concert-card.ts
export const CONCERT_CARD_BARE_SPEC = { gap: 11, coverRadius: 8, titleLineHeight: 21 } as const

// cards/ConcertCard.css.ts          // native/ConcertCard.tsx
gap: bare.gap,                       gap: bare.gap,
```

이러면 "값이 갈리면 버그다" 가 주석의 다짐이 아니라 **한 곳을 고치면 양쪽이 따라오는 사실**이 된다.
prop 도 같은 이유로 묶는다 — 다음 절.

### 공통 prop — 올릴지 말지의 기준

`contract/index.ts` 에 "prop 인터페이스 전체를 올리지 않는다" 가 있는데, **그 근거를 봐야 한다.**
근거는 *공통 조상이 없다* 였다 — 웹 `Button` 은 `ButtonHTMLAttributes` 를, native 는
`TouchableOpacityProps` 를 extends 하므로 억지로 묶으면 웹의 `asChild` 와 native 의 `label` 이
갈 곳을 잃는다.

**근거가 성립하지 않으면 규칙도 안 걸린다.** 판정은 이 한 줄이다:

> 두 구현이 **플랫폼 타입을 extends 하는가?**
> · 한다 → 축과 값만 올리고 인터페이스는 각자 쓴다 (`Button`·`TextInput`·`Toast`)
> · 안 한다 → **공통분을 올린다** (`ConcertCard`)

`ConcertCard` 는 양쪽 다 아무것도 extends 하지 않아 `ConcertCardBareProps` 를 올렸다.
그러면 각 구현은 **자기만 있는 prop 만** 얹는다.

```ts
// contract/concert-card.ts — 두 구현이 같은 것
export interface ConcertCardBareProps {
  tone: CoverTone
  title: string
  meta: string
  footer?: ReactNode
  coverAction?: ReactNode
  reserveTitleLines?: boolean
  // …
}

// native/ConcertCard.tsx — 얹을 게 없다
export type ConcertCardProps = ConcertCardBareProps

// cards/ConcertCard.tsx — 웹에만 있는 것만
export interface ConcertCardProps extends ConcertCardBareProps {
  matchLabel?: string          // framed 전용
  eyebrow?: string             // cover 전용
  variant?: ConcertCardVariant // native 는 bare 만 구현 → 그쪽엔 이 prop 이 없다
  className?: string           // RN 엔 자리가 없다
}
```

**JSDoc 도 한 번만 적힌다.** 이게 값 표보다 오히려 크게 먹는 부분이다 — 이름이 같은 prop 은
드리프트가 눈에 띄지만, `reserveTitleLines` 를 "그리드에서 켜고 레일에서 끈다" 고 정한 규율은
한쪽 주석만 갱신돼도 아무도 못 잡는다. 파일이 하나면 갈릴 수가 없다.

⚠️ **`className` 을 공통분에 넣지 않는다.** RN 엔 그 자리가 없다. 소비처가 웹에서 `className`
으로 주던 폭·여백은 RN 에서 **래핑 `View`** 가 준다 — 계약은 같고 주는 방법만 다르다.

### 올리지 않는 것

`contract/index.ts` 의 불변식이 정본이고, 포팅할 때 실제로 걸리는 건 이 셋이다.

- **웹에만 있고 상대가 없는 값.** `@media(tablet)` 치수가 그렇다 — RN 엔 미디어 쿼리가 없어
  갈라질 짝이 없다. **짝이 없으면 계약이 아니다.** 웹 `.css.ts` 에 리터럴로 남긴다
- **색.** `vars.color.strong` ↔ `scheme.strong` 으로 양쪽이 자기 토큰 맵에서 읽는다. `tokens/` 가 정본
- **플랫폼 타입을 extends 하는 컴포넌트의 prop 인터페이스.** 아래 「공통 prop」 참고 —
  올릴지 말지는 *prop 이라서* 가 아니라 **갈 곳 없는 prop 이 생기는가** 로 가른다

### 한쪽에만 있는 컴포넌트

계약이 아니다. `ConcertCard` 의 `variant` 축이 `framed`·`bare`·`cover` 셋인데 native 는
`bare` 만 구현한다 — 그래서 **타입은 올라가되 native 엔 `variant` prop 이 없다.**
나머지 둘을 옮길 때 prop 을 열면 그때가 계약 확장이고, 순서는 그대로 **웹부터**다.

## 배선 — `apps/docs` 에서 native 를 보는 법

`apps/docs/next.config.mjs` 가 `react-native` → `react-native-web` 별칭을 건다. 그래서 RN 용으로
쓴 컴포넌트를 **한 줄도 고치지 않고** 문서 사이트에서 그려볼 수 있다.

- 배선 자체를 의심할 때 볼 판: [`/playground/rnw-probe`](../apps/docs/app/playground/rnw-probe)
- 실제 화면 예: [`/playground/coldsurf-mobile`](../apps/docs/app/playground/coldsurf-mobile) —
  폰 프레임(웹 `div`)만 빼면 전부 `react-native` 다. **billets-app 에 그대로 붙는 코드**이므로,
  "RN 에서도 되겠지" 가 추측으로 남지 않는다
- 아이콘만 `lucide-react`(웹 판)를 쓴다. 실제 RN 은 `lucide-react-native` — 이름·props 가 같아
  import 한 줄이고, RNW 에선 web 판이 그대로 그려져 시안 판정엔 지장이 없다

⚠️ 별칭은 `apps/docs`(private) 의 번들에만 걸린다. **발행물엔 영향이 없다.**

## 소비 — 배럴이냐 서브패스냐

**Metro 는 tree-shaking 을 하지 않는다.** 그래서 `./native` 배럴을 열면 아홉 개가 전부 딸려온다.
아끼려면 소비처가 **`@coldsurfers/design-system/native/Button` 을 직접** 열어야 한다.

근거(metro@0.87 실측):

| 확인 | 결과 |
| --- | --- |
| `grep -rln "treeShak" metro*/src/` | **0건** |
| `experimentalImportSupport` 기본값 | `false` |
| `import()` 로 런타임 분리 | **프로덕션엔 없다** — `asyncRequire` 가 `global.__loadBundleAsync` 를 찾는데, RN 이 그걸 정의하는 자리는 `setUpDeveloperTools.js` 의 `if (__DEV__)` 블록 안이다 |

Babel 이 `export const Button` 을 `exports.Button = ...` 대입으로 바꾸는 순간 런타임 접근이
가능해지므로 죽은 export 를 지울 근거가 사라진다. **배럴은 스플리팅과 원리적으로 양립하지 않는다** —
`export { X } from './X'` 아홉 줄은 최상단 `require()` 아홉 개가 된다.

실측(전이 폐포):

```
native (배럴)     12파일  18,044 B
native/Button      4파일   6,917 B   -62%
native/scheme      3파일   4,890 B   -73%
native/ConcertCard 5파일   9,499 B   -47%
```

**대가도 있다.** 청크가 갈리면서 배럴 폐포가 15,456 → 18,044 B (**+17%**) 로 늘었다.
서브패스로 옮기는 쪽은 -62%, 안 옮기는 쪽은 +2.6 kB — 그게 이 선택의 값이다.

배럴을 남기는 이유는 **빼면 major** 이기 때문이다(`exports` 맵이 API). 둘 다 열어 두고 고르게 한다.

⚠️ **파일 이름은 평평하고(`dist/native-Button.js`) 공개 경로만 중첩이다(`./native/Button`).**
`dist/native/Button` 으로 내보내면 `rollupTypes` 가 그 엔트리에 안 먹어서 `.d.ts` 에
`from '../contract'` 같은 소스 트리 경로가 남고, 그건 `dist/` 에 없다 —
`check:exports` 가 9개 전부 Internal resolution error 로 잡는다. `tokens-native` 가
`./tokens/native` 로 열리는 것과 같은 처리다.

**웹 레인엔 이 진입점들이 없다.** rollup 이 tree-shaking 을 하므로 배럴로 충분하다.
이건 RN 번들러의 한계를 메우는 배선이지 API 취향이 아니다.

## 순서 규율

`native/index.ts` 가 정한 것 그대로다 — **축을 늘려야 하면 웹부터 늘린다.** 이 문서의 절차는
*이미 웹에 있는 것을 옮기는* 절차이고, 없는 것을 여기서 먼저 만들면 계약이 갈라진다.
