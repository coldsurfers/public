# P1 — 경계 확정

정본 로드맵: [coldsurfers/paul-rockstar#220](https://github.com/coldsurfers/paul-rockstar/issues/220)

무엇이 이 패키지의 것이고 무엇이 아닌가를 긋는다. **문서만 — 코드는 P2 부터.**

> ⚠️ Step 0(dist 스파이크)은 아직 안 돌았다. 아래 결정은 "public 이 dist 로만 발행한다"를
> 전제로 서 있다. 스파이크가 그 전제를 깨면 결정 4(codegen)와 이관 목록이 다시 열린다.

---

## 결정

| # | 질문 | 결정 |
| --- | --- | --- |
| 1 | 브랜드 값 오버라이드 | **축별로 가른다** — 범용 축은 열고 브랜드 색은 고정 |
| 2 | `Button` `size.cta` 의 `15px` | **리터럴 유지** + 근거 주석 |
| 3 | warm-paper 헬퍼 귀속 | **쪼갠다** — `coverToneFor` 는 DS, `WARM_PAPER_SURFACE` 는 앱 |
| 4 | `generate.ts` codegen | **paul-rockstar 에 남긴다** |
| 5 | 이관 목록 | 아래 표로 확정 |

---

## 1. 브랜드 값 — 축별로 가른다

걷어내는 건 선택지가 아니다(서비스 정합 DS). 정한 건 *어느 축을 소비자가 갈아끼울 수 있는가* 다.

| | 축 | 근거 |
| --- | --- | --- |
| **열린다** | `spacing` · `radius` · `fontSize` · `lineHeight` · `fontWeight` · `fontFamily` · `breakpoints` | 값은 우리 것이지만 **축 자체는 범용**이다. 4px 격자·rem 타이포 스케일에 남의 제품을 묶을 이유가 없다 |
| **고정** | `color.semantic`(dark·light) · `cover` 6톤 · `paper.warm` · `editorialType` | COLDSURF 고유값. 이걸 바꿀 수 있으면 남는 건 이름뿐이라 DS 가 아니라 빈 껍데기다 |

`editorialType` 은 크기를 `fontSize` 에서 읽는다 — 열린 축의 오버라이드가 여기로 전파된다.
자기 값을 갖는 `letterSpacing`·`textTransform` 만 고정이다.

**메커니즘은 P2 에서 정한다.** VE 는 부분 `createTheme` 이 없어 `vars` 를 노출하고 소비자가
`assignVars` 로 덮는 형태가 될 텐데, 그게 실제로 성립하는지는 코드를 짜 봐야 안다.
여기서 정한 건 *어느 축이 그 대상인가* 까지다.

## 2. `15px` — 리터럴로 남긴다

토큰 타이포 스케일은 12.5~17px 을 `sm`·`base` 로 **의도적으로 접었다**(2026-08-04 실측:
그 구간은 한 파일이 3~5종을 섞어 쓰는 드리프트였다). 15px 하나 때문에 그 결정을 뒤집으면
접었던 구간이 통째로 다시 열린다.

시안 CTA 한 자리의 예외이므로 `Button.css.ts` 안에 두고, **왜 스케일 밖인지를 주석으로** 남긴다.
공개 패키지에서 이 리터럴은 API 가 아니다 — 소비자는 `size="cta"` 만 본다.

> 이 자리가 이 이슈의 발단이었다(코드가 시안 15px 대신 `base` 16px + `line-height: normal`).
> 리터럴을 숨기는 게 그 사고를 다시 부르지 않는가 — **막는 건 이 결정이 아니라 P8 드리프트 검출**이다.

## 3. warm-paper 헬퍼 — 쪼갠다

`apps/web-next/src/stage/live-surface.ts` 22줄이 성격이 다른 둘을 들고 있다.

| 대상 | 귀속 | 근거 |
| --- | --- | --- |
| `COVER_TONES` · `coverToneFor(id)` | **DS** | 토큰 `cover` 팔레트에 직접 물린 순수 함수. 도메인은 `id: string` 으로 이미 밀려나 있다 |
| `WARM_PAPER_SURFACE` | **앱** | "이벤트 상세·`/live-events`·`/magazine` 은 라이트 고정" 은 값이 아니라 **COLDSURF 표면 정책**이다. 계약에 박으면 표면 정책을 바꿀 때마다 major |

`WARM_PAPER_SURFACE` 는 DS 가 export 하는 `lightThemeVars` + `paper.warm` 을 앱에서 조합한다 —
재료는 DS 것이고 조립이 앱 것이다. 이관 후 `live-surface.ts` 는 그 한 줄만 남는다.

## 4. codegen — paul-rockstar 에 남긴다

생성 CSS 를 `@import` 하는 앱이 **5곳** 살아 있다(web-next · coldsurf-studio · atlas ·
auth-portal · personal-site). VE 판 `theme.css.ts` 를 실제로 문 곳은 cockpit 1곳뿐이고,
Next+SST 3앱은 VE 플러그인 문제로 사정권 밖이라 codegen 을 지우면 저 앱들의 토큰이 끊긴다.

그렇다고 public 이 그걸 발행하면 **Tailwind v4 `@theme` 매핑이 공개 API 에 들어간다** —
Tailwind 를 안 쓰는 소비자에겐 의미가 없고, 한번 `exports` 에 오르면 빼는 게 major 다.

따라서 경계는 이렇게 긋는다:

```
public  →  ./tokens      TS 값 + 이름 규칙(tokenVarName · cssVarPrefix · cssVarName)
           ./styles.css  VE 가 구운 변수·리셋·레이어

paul-rockstar → 위 둘을 읽어 자기 앱용 Tailwind @theme CSS 를 생성
```

**이름 규칙 표는 public 이 export 한다.** 두 소비처(발행·계약)가 한 표를 공유해야 한다는 것이
이 이슈의 1절 근거였고, 소비처 하나가 레포 밖으로 나가도 그 요구는 그대로다.

## 5. 이관 목록

### 간다

| 원본 | 도착 |
| --- | --- |
| `packages/tokens/src/tokens.ts` · `index.ts` | `src/tokens/` |
| `packages/design-system/src/{contract,theme,reset,layers,sprinkles}.css.ts` | `src/css/` |
| `packages/design-system/src/{layers,media,component-layer}.ts` | `src/css/` |
| `packages/ui/src/primitives/*` — 컴포넌트 12종 + `cx.ts` + `useDialogBehavior.ts` | `src/primitives/` |
| `packages/ui/src/style-utils.ts` · `motion.css.ts` | `src/css/` |
| `apps/web-next/src/stage/live-surface.ts` 의 `COVER_TONES` · `coverToneFor` | `src/tokens/` |

### 남는다

| 대상 | 근거 |
| --- | --- |
| `packages/tokens/src/generate.ts` | 결정 4 |
| `packages/ui/src/cards` (`ConcertCard`) · `chat` · `markdown-renderer`(shiki) · `image-lightbox` · `theme` | 도메인 조립이거나 무거운 의존을 끌고 온다 |
| `WARM_PAPER_SURFACE` | 결정 3 |

`packages/ui` 는 사라지지 않는다. 잔여 배럴이 npm DS 를 re-export 하는 shim 이 되어
배럴 소비 75곳이 무수정으로 살아남는다(Step 5).

---

## 남은 결정 (P1 밖)

- **열린 결정 3 — primitives 흡수 상한.** 규율을 DS 자체 문서에 둘지 `docs/convention/` 에 둘지.
  이관(Step 3)은 *있는 그대로* 옮기므로 상한 규율은 P3 전까지 없어도 된다
- **열린 결정 4 — 시안 높이 통합**(34/36 → 하나, 46/48 → 하나). Figma 쪽 결정이라 P6
- `sprinkles` 배럴 재수출 여부 — P2
