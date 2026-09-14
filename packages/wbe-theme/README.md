# @coldsurfers/wbe-theme

`@coldsurfers/wbe-tokens` 의 **값** 위에 얹는 실제 스타일 레인. CSS 변수 발행 · 웹폰트 ·
vanilla-extract recipe 를 담는다.

```tsx
import '@coldsurfers/wbe-theme/fonts'
import { text, hairline, dashedSlot, vars } from '@coldsurfers/wbe-theme'
import { sprinkles } from '@coldsurfers/wbe-theme/sprinkles'

<header className={hairline({ side: 'bottom' })}>
  <span className={text({ variant: 'label' })}>WHITE BLIND EYE</span>
  <span className={text({ variant: 'label', tone: 'muted' })}>RECORD LABEL — SEOUL</span>
</header>

<section className={sprinkles({ paddingX: 'padPage', paddingTop: 'padSectionTop', gap: 'gapLg' })}>
  <h1 className={text({ variant: 'display' })}>WHITE BLIND EYE</h1>
</section>

<div className={`${dashedSlot} ${sprinkles({ boxSize: 'tile' })}`} />
```

CSS 는 진입점이 물고 온다 — `styles.css` 를 따로 import 하지 않는다.

## 무엇이 어디에 있나

| 진입점 | 담는 것 |
| --- | --- |
| `.` | `vars` · `text()` · `hairline()` · `dashedSlot` · 토큰 값 재수출 |
| `./sprinkles` | 레이아웃·색 원자 유틸. 무게 때문에 갈라 뒀다 |
| `./fonts` | fontsource self-host 부수효과 4줄 |
| `./layers` | `LAYER_ORDER` — 번들러 없이 순서만 읽는 자리 |

## 설계 결정 4건

1. **활자는 `text()` 하나로 묶는다.** 시안에서 패밀리와 크기는 항상 붙어 다닌다(136px 은
   언제나 Archivo Black). 축을 따로 열면 시안에 없는 조합이 만들어진다. 색만 `tone` 으로 분리.
2. **sprinkles 에는 레이어를 안 단다.** unlayered 가 모든 레이어를 이기므로 호출부가 넘긴
   유틸이 recipe 를 덮는다 — 유틸이 유틸답게 동작하는 유일한 배선이다.
3. **sprinkles 값 이름은 토큰 키 그대로**(`paddingX: 'padPage'`). 사전을 한 벌 더 만들면
   토큰이 바뀔 때 조용히 어긋난다.
4. **점선은 `repeating-linear-gradient` 로 그린다.** CSS `border-style: dashed` 는 패턴을
   지정할 수 없어 토큰 `border.dashArray`(6/6)가 반영되지 않는다.

## 빌드 배선

- `wbe-tokens` 는 **external 이 아니다**(devDependency) — 값이 번들에 인라인되므로
  이 패키지를 발행할 때 토큰 패키지를 같이 공개하지 않아도 된다.
- `@fontsource/*` 는 **external 이다.** 번들에 넣으면 폰트 바이너리가 우리 `dist` 로 들어온다.
- `fonts.ts` 는 `.d.ts` 를 만들지 않는다 — 부수효과만 있는 모듈이라 빈 선언이 되고,
  api-extractor 가 거기서 죽는다. `exports` 맵에서도 `types` 가 없다.

## 상태

**비발행(`private: true`)이다.** 소비처는 paul-rockstar 의 WBE Cloudflare Workers 페이지가
첫 번째가 된다. 발행 전환 시엔 `publishConfig` · changeset · `check:exports` 가 같이 온다.
