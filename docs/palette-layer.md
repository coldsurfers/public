# 팔레트 층 — `--cs-*` 를 DS 가 진다

**문서만. 코드는 승인 후.** 정하는 것은 하나다 — *COLDSURF 원색이 어디 사는가.*

전제: [`p1-boundary.md`](p1-boundary.md) 결정 1(축별로 가른다). 충돌하면 그쪽이 이긴다.

---

## 1. 문제 — 앱 셋이 서로 모른 채 같은 우회를 팠다

| 앱 | 로컬 팔레트 | 크기 |
| --- | --- | --- |
| `apps/im-coldsurf` | `--cs-*` 18색 + 그라디언트 6 + 그림자 2 + scrim | `app/theme.css.ts` 147줄 |
| `apps/beam-web` | `--beam-*` 8색 | `app/theme.css.ts` 77줄 |
| `apps/web-next` | `--cs-grad-hero` 1 | `src/theme.css.ts` (2026-09-19 추가) |

구조가 같다 — **원색을 접두 변수로 선언하고, 그걸 DS 의 의미이름(`--bg`·`--text`…)에 먹인다.**
파일 이름·주석·레이어 처리까지 같다.

두 앱이 독립적으로 같은 모양을 팠다면 앱이 특이한 게 아니다. **DS 가 원색 층을 안 갖고 있다.**

### p1-boundary 와 어긋나는 지점

결정 1 은 `color.semantic` 을 **고정** 축으로 뒀다 — "이걸 바꿀 수 있으면 남는 건 이름뿐이라
DS 가 아니라 빈 껍데기다". 그런데 `beam-web` 은 18색을 전부 덮고 있다. 결정이 틀린 게 아니라
**결정이 닫지 않은 자리**다: 고정한 건 *의미이름의 값*인데, 앱이 실제로 필요했던 건
*원색을 부를 이름*이었다.

---

## 2. 결정 — 두 층으로 가른다

```
① 팔레트   --cs-deep-night: #0A0F1A        ← 새로 생긴다. DS 가 발행. 고정 축
② 의미     --text: var(--cs-deep-night)    ← 이름 그대로. 값만 ①을 가리킨다
```

im-coldsurf 가 이미 세워 둔 구조를 그대로 DS 로 올린다. 새로 발명하지 않는다.

**의미이름 23개는 하나도 안 바뀐다.** 그래서 소비처 수정이 0이고 major 가 아니다.

### 왜 `--cs-` 를 의미이름까지 바르지 않는가

전면 개명(`--bg` → `--cs-bg`)의 실측 비용:

| | 날것 `var(--x)` | 파일 |
| --- | --- | --- |
| `coldsurfers/public` | 1,429 | ~136 (`apps/docs` 만 129) |
| `coldsurfers/paul-rockstar` | 1,361 | 32 |
| **합계** | **2,790** | **~168** |

여기에 **동적 주입 47곳**(`'--bg': …` 오브젝트 키)이 5개 파일에 더 있다 —
`beam-web/theme.css.ts` · `im-coldsurf/theme.css.ts` · `web-next/{stage/live-surface,pages/TasteEngine/surface}.ts` ·
`personal-site/stage/live-surface.ts`. **문자열 키라 타입체크가 안 잡는다.** 하나 빠뜨리면
빌드·감사를 다 통과한 채 화면만 조용히 깨진다.

그리고 바르는 순간 위 2층 구분이 도로 한 층이 된다. 접두가 *팔레트*를 뜻하지 않고
*DS 소속*을 뜻하게 되면, 원색과 의미를 이름으로 구별할 수단이 사라진다.

**순서는 ② → ① 은 되고 ① → ② 는 안 된다.** 전면 개명이 나중에 필요하면 그때 codemod 한다.

---

## 3. 팔레트 목록 — `--cs-*`

정본은 `apps/im-coldsurf/app/theme.css.ts`. Figma Playground-Dev-CM Page 16 팔레트 보드에서 온 값이다.

### 보드 10색 — DS 에 이미 값이 있다

| `--cs-*` | hex | 지금 DS 어디에 |
| --- | --- | --- |
| `deep-night` | `#0A0F1A` | `light.text` · `ink.base` |
| `card` | `#161E2E` | `ink.surface` |
| `divider` | `#263248` | `light.body` · `ink.border` |
| `glacier` | `#EAF6FF` | `light.surface2` |
| `white` | `#FFFFFF` | `light.surface` |
| `surf-blue` | `#2563FF` | `light.accent` |
| `ice-blue` | `#7DD3FC` | `ink.accent` |
| `mist` | `#9CA3AF` | `light.subtle` |
| `slate` | `#5B6472` | `light.muted` |
| `haze` | `#C3CBD6` | `light.faint` |

값이 이미 있으므로 **이름만 생긴다.** 시각 회귀 0.

### 파생 6색 — DS 에 없다

| `--cs-*` | hex | 쓰임 |
| --- | --- | --- |
| `night-deep` | `#0B132E` | 히어로 그라디언트 끝. deep-night 에서 푸르게 한 단 |
| `card-deep` | `#101A2E` | 아티스트 카드 바닥 |
| `tile` | `#111A2B` | 숫자 타일. 잉크 위라 card 보다 한 단 어둡다 |
| `nav-text` | `#E5E7EB` | 잉크 밴드 위 내비 글자 |
| `paper-sunk` | `#EDF1F6` | 가라앉은 라이트 면 |
| `hairline` | `#DCE3EB` | 라이트 구분선 |

`paper` `#F5F7FA` · `hairline-strong` `#D7DEE7` 은 각각 `light.bg` · `light.border` 와 같은 값이라
보드 10색과 같은 취급(이름만).

⚠️ **`paper-sunk` `#EDF1F6` 과 `hairline` `#DCE3EB` 은 기존 값과 1~2단위 차이다** —
`surfaceHover` `#eef2f7` · `borderSoft` `#e5ebf2`. 통합할지 별개로 둘지는 §6 미결 ⓑ.

### 그라디언트 6 · 그림자 2 · scrim 1

DS 에 **그라디언트·그림자 축 자체가 없다.**

```
--cs-grad-hero    linear-gradient(180deg, #0A0F1A 0%, #0B132E 100%)
--cs-grad-show    linear-gradient(135deg, #EAF6FF 0%, #C7E4FF 100%)
--cs-grad-artist  linear-gradient(135deg, #101A2E 0%, #0A0F1A 100%)
--cs-grad-venue   linear-gradient(135deg, #DCEEFF 0%, #EAF6FF 100%)
--cs-grad-ticket  linear-gradient(135deg, #F1F5F9 0%, #E3EDF7 100%)
--cs-grad-panel   linear-gradient(135deg, #EAF6FF 0%, #DDE9FF 100%)

--cs-shadow-note  0 6px 18px rgba(10, 23, 51, 0.08)
--cs-shadow-cta   0 10px 26px rgba(37, 99, 255, 0.28)
--cs-scrim        rgba(10, 15, 26, 0.64)
```

그라디언트 정지색 5개(`#C7E4FF` `#DCEEFF` `#F1F5F9` `#E3EDF7` `#DDE9FF`)는 **이름을 안 준다** —
소비처가 그라디언트 안뿐이라 이름이 값보다 짧지 않다. 값 안에 리터럴로 둔다.

**shadow 는 im 2건을 올리는 게 아니라 DS 내부 부채 정리다** — DS 자기 컴포넌트가 이미
서로 다른 boxShadow 4종을 리터럴로 들고 있다. 그 넷을 같은 축으로 접는 게 본체고, im 의 둘은 덤이다.

---

## 4. 의미이름 23개 — 무엇을 가리키게 되는가

값이 안 바뀐다. 참조만 리터럴 → `var(--cs-*)` 로 바뀐다.

| 의미이름 | → 팔레트 | 의미이름 | → 팔레트 |
| --- | --- | --- | --- |
| `--bg` | `paper` | `--heading` | `deep-night` |
| `--surface` | `white` | `--accent` | `surf-blue` |
| `--surface-2` | `glacier` | `--accent-hover` | (기존값 유지) |
| `--surface-hover` | `paper-sunk`? ⓑ | `--link` | `surf-blue` |
| `--border` | `hairline-strong` | `--link-hover` | (기존값 유지) |
| `--border-soft` | `hairline`? ⓑ | `--ink-base` | `deep-night` |
| `--text` | `deep-night` | `--ink-surface` | `card` |
| `--strong` | (기존값 유지) | `--ink-border` | `divider` |
| `--body` | `divider` | `--ink-accent` | `ice-blue` |
| `--muted` | `slate` | `--paper-warm` | (독립. 팔레트 밖) |
| `--subtle` | `mist` | `--status-*` | (독립. 팔레트 밖) |
| `--faint` | `haze` | | |

`paper.warm` `#f9fbfd` 과 status 색은 브랜드 보드 밖이라 팔레트에 안 넣는다.
`--strong` `#05090f` 도 보드에 없다 — 보드 색으로 접을지는 미결 ⓔ.

---

## 5. 함께 여는 축

팔레트만 올리면 앱 우회가 절반만 회수된다. 같은 릴리스에서 닫을 것:

| # | 축 | 내용 | 파급 |
| --- | --- | --- | --- |
| 1 | **`ink` 배선** | `ink` 가 `tokens` 집계 객체에 빠져 있어 `tokens/native.ts` 에 안 실린다 → **RN 이 다크 밴드 색을 못 쓴다.** 값 추가 0, 배선만 | **0** |
| 2 | `shadow` 그룹 | `cssVarPrefix.shadow` 신설 + DS 내부 리터럴 4종 흡수 | 0 (신설) |
| 3 | `gradient` 그룹 | 위 6종 | 0 (신설) |
| 4 | `radius` 확장 | 천장 12px. im 실사용 9종 중 스케일 안은 `full` 하나뿐 → ⓒ | 0 (추가만) |
| 5 | 디스플레이 램프 | ⚠️ **추가 불필요할 수 있다** — 아래 | 0 |

### 5번 판정 (2026-09-19) — **접히지 않는다. 그리고 ②의 일이 아니다**

먼저 감찰의 "타입 램프 천장 24px" 은 **오측이다.** `fontSize` 는 `6xl` = 3.75rem(60px)까지
있고 `editorialType.display` 는 `md: clamp(28px, 4vw, 56px)` · `lg: clamp(34px, 6vw, 88px)` 다.

그래서 im 의 히어로(34→56)가 `display.md` 로 접히는지 실측했다:

| | im `heroTitle` | DS `display.md` |
| --- | --- | --- |
| 크기 | 34 → 56 (브레이크포인트 계단) | `clamp(28px, 4vw, 56px)` (뷰포트 유동) |
| 자간 | −0.02em | −0.018em |
| **행간** | **1.38** | **1.05** |

크기 상한(56)과 자간은 사실상 같다. **행간이 못 접는다** — 1.05 는 한 줄짜리 영문 디스플레이
전제이고, im 히어로는 3줄 한글이라 1.05 면 줄이 서로 붙는다. `apps/web-next` 랜딩 정렬에서도
같은 자리가 독립적으로 걸렸다(1.06 → 1.38).

**그런데 이걸 지금 고치지 않는다.** im 램프는 크기·행간·자간을 함께 묶은 **합성 슬롯 8종**이고
(`heroTitle`·`sectionTitle`·`featureTitle`·`sectionLead`·`body`·`footnote`·`wordmark`·`kicker`),
그중 8개 크기(34·56·44·26·38·15·13·10)가 `fontSize` 스케일 밖이다. 합성 슬롯을 정하는 것은
**프리미티브 층(P3)을 정하는 것**이지 토큰 층의 일이 아니다.

증인도 아직 하나다 — `apps/web-next` 의 `landing-type.css.ts` 가 같은 값을 갖지만 그건
2026-09-19 에 im 을 보고 맞춘 것이라 독립 증인이 아니다. AGENTS.md 의 흡수 기준
("두 곳 이상에서 쓰인다")을 아직 못 넘는다.

→ **P3 으로 넘긴다.** 이 축은 ② 에서 값을 추가하지 않는다.

---

## 6. 앱에서 지워지는 것

| 앱 | 지워지는 것 |
| --- | --- |
| `im-coldsurf` | `app/theme.css.ts` 의 팔레트 선언 전체(18색 + 그라디언트 6 + 그림자 2 + scrim). `cs` 객체는 `var()` 별칭이라 DS 재수출로 대체 |
| `beam-web` | **안 지워진다** — `--beam-*` 는 다른 브랜드다. 다만 *구조*가 같아지므로 선례로 남는다 |
| `web-next` | `src/theme.css.ts` 의 `--cs-grad-hero` |

`beam-web` 이 남는다는 게 결정 1 과의 긴장을 그대로 드러낸다 — §7 ⓐ 가 그걸 판정해야 한다.

---

## 7. 미결 — 정하지 않았다

| | 질문 | 왜 갈리나 |
| --- | --- | --- |
| **ⓐ** | **팔레트 축은 열리는가 고정인가** | 결정 1 은 `color.semantic` 을 고정했는데 `beam-web` 이 덮고 있다. 팔레트를 고정하면 beam 은 영구 예외고, 열면 "남는 건 이름뿐" 이 된다. **가장 큼 — 나머지가 여기 물려 있다** |
| **ⓑ** | `paper-sunk`(#EDF1F6) vs `surfaceHover`(#eef2f7) · `hairline`(#DCE3EB) vs `borderSoft`(#e5ebf2) | 1~2단위 차. 통합 / 별개 슬롯 / DS 값 이동(= major, 소비 165곳). `tokens.ts` 의 "off-white 이름 사전" 이 *구별 대상* 선례를 이미 세웠다 |
| **ⓒ** | radius 를 어디까지 | 2xl·3xl 둘만 vs 시안 6종 |
| **ⓓ** | Geist Variable 을 4번째 `fontFamily` 로 | RN 폰트 등록 부담이 딸려 온다 |
| **ⓔ** | `--strong` `#05090f` 을 `deep-night` 으로 접을지 | 보드에 없는 값. 접으면 web-next 잉크 밴드가 한 단 밝아진다 |
| **ⓕ** | 그라디언트 축 부재가 결정인가 우연인가 | 문서에 한 줄 필요. 지금은 흔적이 없다 |

**ⓐ 가 먼저다.** 나머지 다섯은 ⓐ 가 정해지면 대부분 자동으로 따라온다.

---

## 8. 착수 순서

`ink` 배선(파급 0)만 ⓐ 와 무관하게 먼저 칠 수 있다. 나머지는 ⓐ 뒤.

```
0. ink 배선 수정                       ← 지금 가능. RN 축이 여기서 열린다
   ⌐ ⓐ 결정 ┐
1. --cs-* 팔레트 발행 + 의미이름 재배선   ← 값 변화 0, 시각 회귀 0
2. shadow · gradient 그룹 신설
3. radius 확장 (ⓒ 후)
4. 디스플레이 램프 — 먼저 clamp 접힘 판정
5. 앱 셋에서 로컬 팔레트 회수
```

전 단계 `pnpm changeset`. 1~5 는 이름이 안 없어지므로 **minor**.

검증은 `AGENTS.md` 의 다섯(`biome ci` · `check:type` · `build` · `check:exports` · `test`) +
**`styles.css` 크기**(`sideEffects` 사고 게이트) + `apps/docs` 빌드(계약 생존 증거).
