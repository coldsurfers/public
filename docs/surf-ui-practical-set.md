# surf-ui 실전 세트 — 안 쓰는 걸 걷고, 웹 · 모바일이 같이 쓰는 부품으로

> 상태: 스펙(2026-10-19), 구현 전. 근거 시안: Figma `COLDSURF` 「🧱 공통 요소」 · 「📘 Sheet — 가이드」.
> 포팅 절차는 [`native-lane-porting.md`](./native-lane-porting.md), 공유 규율은 `src/contract/index.ts`.

## 일
surf-ui 의 상당수가 곧 내릴 web-next 만 쓴다. 반대로 시안에서 실제로 되풀이되는 시트 · 토스트 · 탭바는 yellownmusk · billets-app 이 각자 따로 만들어 쓴다. 이걸 뒤집는다 — **쓰는 것만 남기고, 남는 것은 웹 · RN 두 레인 + 계약(`src/contract/`)을 다 갖춘다.**

「같이 쓴다」의 뜻은 `contract/index.ts` 그대로다 — **타입과 값(치수 · 토큰 키)까지 공유, 스타일은 레인마다.** 한 컴포넌트는 `contract/X.ts` · `primitives/X.tsx` · `native/X.tsx` 셋이 있어야 끝난다.

## 실측 (2026-10-19, import 문 기준 — 렌더 횟수 아님)

- 웹: paul-rockstar 479개 import. web-next 를 빼면 yellownmusk · business · beam-web · coldsurf-login · im-coldsurf · personal-site
- RN: wamuseum billets-app · settings-mini-app. `native/Text` 54 · `tokens/native` 76 · `native/Button` 30 · `native/Spinner` 20 · `native/Toast` 20
- billets-app 은 `@gorhom/bottom-sheet` 를 **직접** 5곳에서 쓴다(검색 결과 · 보드 고르기 · 푸시 동의 …) — 시트가 DS 밖에 있다

## 남길 세트 — 레인별 현황과 할 일

| 부품 | 웹 | RN | 계약 | 할 일 |
| --- | --- | --- | --- | --- |
| Button | ✅ | ✅ | ✅ | 유지 |
| Chip | ✅ | ✅ | ✅ | 유지 |
| Spinner · Skeleton | ✅ | ✅ | ✅ | 유지 |
| Text | `text()` | ✅ | ✅ `TEXT_STYLE_SPEC` | 유지 |
| IconButton | ✅ | ✅ | ❌ | 계약 `ICON_BUTTON_SPEC` 올리기 |
| Field | ✅ `Field` | ✅ `TextInput` | ❌ | 이름을 `Field` 로 맞추고 계약 |
| Toast | ✅ | ✅ | ✅ `TOAST_SPEC`(#304, RN 값이 정본) | yellownmusk `shared/ui/toast` 를 이걸로 바꾼다 |
| **BottomSheet** | `Sheet`(web-next 만) | ❌ | ✅ `SHEET_SPEC`(#305) | Kind `modal`(radius/sheet 28 · 아래 24) · `map`(24 · 16), 손잡이 36×4. RN = `@gorhom/bottom-sheet` 감싸기, 웹 = `Sheet` 다시 쓰기. `Modal` 은 흡수할지 판단 |
| PinCard | ✅ | ❌ | ❌ | RN 포팅 + 계약. RN `ConcertCard` 는 import 0 → 지운다 |
| TabBar | ❌ (yellownmusk `app-shell` 로컬) | ✅ `AnimatedTabBar` | ❌ | 계약 + 웹 올리기. RN `TabBar` 본체는 import 0(`useTabBarHeight` 만) → 정리 |
| Badge | `StatPill`(web-next) | ❌ | ❌ | yellownmusk `ai-badge` + `StatPill` → `Badge` 하나로 두 레인 |
| DateBlock | ❌ | ❌ | 토큰만(`size/date-block-*`) | 시안 10곳. 두 레인 새로 |

로그인 시트는 surf-ui 가 아니라 `@coldsurf/coldsurf-login` 몫이다 — surf-ui 는 `BottomSheet` 까지만 준다.

## 걷을 것

| 무엇 | 언제 |
| --- | --- |
| web-next 만 쓰는 것 — `Modal`(BottomSheet 판단 뒤) · `useToast`(웹) · `RowAction` · `Eyebrow` · `CoverBlock` · `StatPill` · `Callout` · `ReactionBar` · `useSurfaceMode` · `ConcertCard(Skeleton)` · `PosterThumb` · `MediaRow` · `PickCard` · `Page` · `Container` · `PageBanner` · `inkSurfaceVars` · `printThemeVars` | web-next 폐기(paul-rockstar `specs/yellownmusk/web-next-sunset.md` 8단계) **뒤** major. 그 전엔 `@deprecated` 만 |
| import 0 — `PickRow` · RN `ConcertCard` · RN `TabBar` 본체 | 지금 |
| personal-site 만 쓰는 것 — `ArticleCard` · `LeadFeature` · `Popover` · `sprinkles` · `alpha` · `lineClamp` | 미결 — 앱 안으로 내릴지 |

지울 때 `apps/docs` 의 해당 페이지 · playground 도 같이 내린다(docs 가 surf-ui 를 54번 import).

## 같이 고칠 것

- **색 기본 모드.** `surf-ui / color` 기본이 `ink`(다크)인데 COLDSURF 는 라이트 고정이다. Figma 에서 `bg/base` 를 묶었더니 시트가 검게 그려졌다 → 기본을 `light` 로
- ~~지도 시트 모서리 24~~ — `radius/sheet-map` 을 새로 만들었다(#305). 포스터와 따로 움직일 값이라 빌리지 않았다
- **`radiusPoster` 가 갈려 있다** — 코드 16 · Figma 변수 24. 시안 PinCard 는 16

## 순서

```
1 ✅ 계약 값 정본 결정 — Toast 치수(#304) · Sheet map 모서리(#305) · Button 누름(#303)
2 BottomSheet 두 레인                                      → 검증: billets-app 5곳 · yellownmusk login-dialog 를 바꿔 끼워 typecheck · 화면
3 Toast 통일                                              → 검증: yellownmusk 로컬 toast 삭제 후 화면
4 PinCard RN · TabBar 웹 · Badge · DateBlock              → 검증: docs playground 두 레인 나란히
5 import 0 삭제 · web-next 전용 @deprecated               → 검증: 소비 앱 전부 check:type
6 web-next 폐기 뒤 major 삭제 + docs 정리                  → 검증: changeset major · 소비 앱 빌드
```

스텝마다 `pnpm changeset`. 각 스텝은 따로 PR.

## 미결

- 걷는 시점 — web-next 폐기를 먼저 끝낼지, `@deprecated` 로 먼저 표시만 할지
- personal-site 전용 6개의 자리
- `Modal` 을 `BottomSheet` 로 흡수할지(웹 가운데 다이얼로그가 남는가)
