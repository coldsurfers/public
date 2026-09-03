# @coldsurfers/tailwind4-theme

COLDSURF 토큰을 Tailwind CSS **v4** 의 `@theme` 로 이어 붙이는 한 장짜리 브릿지.

`bg-bg` · `text-heading` · `bg-cover-forest` · `p-4` 같은 유틸이 우리 토큰 값을 쓰게 만든다.
JS 는 없다 — `exports` 가 가리키는 건 CSS 파일 하나다.

## 설치

```bash
pnpm add -D @coldsurfers/tailwind4-theme
```

`tailwindcss@4` 와 `@coldsurfers/design-system` 이 peer 다. 값의 정본은 DS 쪽이고
이 패키지는 그 값을 **`var()` 로 참조**하므로, 변수 시트를 같이 물어야 한다.

```css
@import "tailwindcss";
@import "@coldsurfers/design-system/tokens.css"; /* :root 변수 — 반드시 같이 */
@import "@coldsurfers/tailwind4-theme";
```

DS 의 `styles.css`(리셋·컴포넌트까지 든 전량)를 이미 물고 있다면 `tokens.css` 는 없어도 된다 —
같은 이름에 같은 값이라 둘 중 하나면 충분하다.

## 이름에 `4` 가 붙은 이유

Tailwind major 마다 `@theme` 규약이 갈린다. 이름에 major 를 박아 두면 v5 용을 **나란히**
낼 수 있다 — 기존 소비자를 깨지 않고. (선례: `@seed-design/tailwind4-theme`)

## 왜 DS 안이 아닌가

`@theme` 매핑은 Tailwind 소비자에게만 의미가 있는데, DS 의 `exports` 에 한번 오르면 빼는 게
major 다. 패키지를 가르면 안 쓰는 쪽은 설치를 안 해 0 바이트다.
근거는 [`docs/p1-boundary.md`](../../docs/p1-boundary.md) 결정 4.

## 라이선스

MIT
