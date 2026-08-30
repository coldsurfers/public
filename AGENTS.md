# AGENTS.md

`coldsurfers/public` 레포에서 작업할 때의 규약.

**여긴 밖으로 나가는 코드다.** 사내 워크스페이스 패키지와 다른 점은 하나 — 바꾼 순간 남의 빌드가
깨질 수 있다. 그래서 판단 기준이 "돌아가는가" 가 아니라 **"이 API 를 계약으로 지킬 수 있는가"** 다.

전역 행동 규범(`NORMS.md`)이 상위고, 충돌하면 이 문서가 이긴다.

---

## 검증

```bash
pnpm biome ci .     # lint + format + import order
pnpm check:type     # turbo run check:type
pnpm build          # turbo run build
pnpm check:exports  # turbo run check:exports — 발행될 exports·d.ts 를 attw 로 해석해본다
```

넷 다 통과해야 커밋한다. pre-commit 에서 biome, pre-push 에서 biome ci + check:type 이 돈다
(`lefthook.yml`). `--no-verify` 금지.

| 바꾼 것 | 추가로 볼 것 |
| --- | --- |
| `packages/*/src/**` | `pnpm changeset` 을 남겼는가 |
| `package.json` 의 `exports` | 새 진입점이 `vite.config.ts` 의 `lib.entry` 에도 있는가 · `dist/` 에 실제로 떨어지는가 · `pnpm check:exports` 가 통과하는가 |
| `.css.ts` | `@layer` 를 벗어나지 않았는가 — 컴포넌트 스타일은 `ds-components` |
| peer/deps 이동 | 컴파일된 `dist/` 가 실제로 그걸 import 하는가 (VE 는 build-time 과 runtime 이 갈린다) |
| primitives 추가·변경 | `apps/docs` 에 페이지가 있는가 · 미리보기가 실제로 그려지는가 |

## 공개 패키지라서 다른 것

- **`exports` 맵이 API 다.** 여기 없는 경로는 소비자가 못 연다 — 반대로 여기 있으면 뺄 때 major 다.
- **`.css.ts` 는 이 레포에서 컴파일한다.** 소스를 발행하면 소비자마다 VE 플러그인을 달고
  `node_modules` 까지 처리하도록 열어야 한다. 그건 계약이 아니라 부탁이다.
- **`cssCodeSplit: false` 는 편의 선택이지 불변식이 아니다.** 소비자가 CSS 배선을 안 지는 대신
  tree-shaking 을 포기한다. VE 는 라이브러리엔 반대쪽(`preserveModules`)을 권한다 — 재검토 #1.
- **`sideEffects` 에서 `**/*.css.ts` 를 빼지 말 것.** 빼면 롤업이 `.css.ts` 모듈을 부수효과 없음으로
  보고 통째로 지운다. 빌드는 성공하고 `styles.css` 만 조용히 비는데(실측: 35.9 kB → 0.15 kB),
  타입도 감사도 이걸 못 잡는다. **`styles.css` 크기가 게이트다.**
- **JS 가 무거운 모듈은 배럴이 아니라 자기 진입점으로 연다.** `sprinkles` 가 그 자리다 —
  배럴에 넣으면 `vars` 한 줄 쓰는 소비처까지 38 kB 를 문다(`index.js` 3.2 → 41.2 kB 실측).
- **버전은 changeset 으로만 올린다.** `package.json` 의 `version` 을 손으로 만지지 않는다.
- **이미 발행 중이다.** `design-system` · `markdown-renderer` 둘 다 GitHub Packages 에 올라가 있고
  (`publishConfig.registry`), paul-rockstar 의 앱 셋이 레지스트리에서 물어간다. `private: true` 는
  루트에만 남아 있다. **`exports` 를 빼거나 경로를 바꾸면 그 순간 major 다.**

## 문서 사이트가 계약 검증이다

[`apps/docs`](apps/docs) 는 발행되지 않는(`private`) 워크스페이스지만, 소스가 아니라 **발행되는
`dist`** 를 문다(`workspace:*` + exports 맵). 그래서 **사이트가 빌드된다는 것 자체가 계약이
살아 있다는 증거**다 — `exports` 에서 경로를 빼면 그 순간 문서 빌드가 깨진다.

- 미리보기는 `examples/*.tsx` **파일 하나**가 렌더링과 코드 블록 양쪽의 정본이다. 둘이 어긋나려면
  파일이 둘이어야 하는데 하나다
- props 표는 DS 소스 타입에서 뽑고, 토큰 표는 `/tokens` 에서 값을 읽는다. **문서에 값을 옮겨
  적지 않는다** — 옮겨 적으면 토큰이 바뀔 때 문서가 조용히 거짓말을 시작한다
- 정적 내보내기다(`output: 'export'`). 검색 인덱스까지 빌드 산출물이라 서버 런타임이 없고,
  `out/` 을 Cloudflare Workers 정적 자산으로 올린다. OpenNext 를 들이지 않는다
- CSS 순서는 `app/layout.tsx` 의 import 순서다: tailwind → `styles.css` → `ds-bridge.css`.
  마지막 파일이 `ds-reset` 의 `body` 를 **레이어 밖 규칙**으로 되돌린다

⚠️ **`primitives` 배럴에는 `'use client'` 가 없다.** 그래서 RSC 소비자는 서버 컴포넌트에서
직접 import 할 수 없고, 경계를 자기가 그어야 한다(문서의 `examples/*` 가 전부 `'use client'` 인
이유). Vite 소비처(paul-rockstar)에선 안 드러나던 축이다 — 열지 말지는 아직 안 정했다.

## 무엇을 여기로 옮기는가

기준은 *범용성* 이 아니라 **재활용성**이다. 도메인 타입 · 라우터 · i18n 문자열을 직접 만지는 건
제외 사유가 아니라 **밀어낼 대상**이다.

| | 판정 |
| --- | --- |
| 셋을 props·slot 으로 밀어낼 수 있고, 두 곳 이상에서 쓰인다 | **옮긴다** |
| 밀어낼 수 있으나 한 곳에서만 쓰인다 | 보류 — 두 번째 소비처가 생길 때 |
| 밀어낼 수 없다 (그 자체가 도메인 조립) | 앱에 남는다 |

**흡수에는 상한이 있다.** 시안 컨트롤 높이가 다섯 종이라 그대로 받으면 `Button.size` 가 7종이
된다 — 그건 추상화가 아니라 목록이다. variant 를 늘리기 전에 *이 축이 이 컴포넌트의 것인가*를 묻는다.

## 지금 어디까지 왔나

정본 로드맵: [coldsurfers/paul-rockstar#220](https://github.com/coldsurfers/paul-rockstar/issues/220)

- [x] **P0 — 레포 뼈대.** 워크스페이스 · 빌드 · CI · 릴리스 레인
- [x] **P1 — 경계 확정.** 브랜드 테마 ↔ 범용 축 분리선. `live-surface.ts` 의 warm-paper 헬퍼 귀속
      → [`docs/p1-boundary.md`](docs/p1-boundary.md)
- [x] **P2 — 병합.** `tokens` + `design-system` 을 한 패키지로. 이름 규칙 소비처 2곳 → 1곳
- [ ] **P3 — primitives 흡수.** 상한 규칙을 먼저 적고, 그다음 컨트롤 편입
- [x] **P4 — 공개 배포.** `private` 해제 · GitHub Packages 발행 · paul-rockstar 소비 경로 전환
- [x] **P5 — 문서 사이트.** `apps/docs` (Fumadocs 정적 · Cloudflare). Foundations 4 + primitives 19

P3 의 컨트롤을 편입할지 판정하기 전에 `docs/p1-boundary.md` 를 읽는다 — 어느 축이 열리고
무엇이 앱에 남는지가 거기서 정해졌고, 안 읽으면 코드로 임의 결정된다.

## 커밋

scope 는 패키지 이름 또는 `repo`.

```
feat(design-system): tokens 병합
chore(repo): CI 워크플로 추가
```
