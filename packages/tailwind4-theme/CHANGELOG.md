# @coldsurfers/tailwind4-theme

## 0.1.0

### Minor Changes

- [#53](https://github.com/coldsurfers/public/pull/53) [`08298c8`](https://github.com/coldsurfers/public/commit/08298c86acc8e7e67536f583e198bf28de525811) Thanks [@yungblud](https://github.com/yungblud)! - 신규 패키지 — COLDSURF 토큰을 Tailwind v4 `@theme` 로 잇는 한 장짜리 브릿지.

  `bg-bg` · `text-heading` · `bg-cover-forest` · `p-4` 가 우리 토큰 값을 쓰게 만든다. JS 는 없고
  `exports` 가 가리키는 건 CSS 파일 하나다. peer 는 `tailwindcss@4` 와 `@coldsurfers/design-system`.

  DS 안에 넣지 않은 이유: `@theme` 매핑은 Tailwind 소비자에게만 의미가 있는데 DS 의 `exports` 에
  한번 오르면 빼는 게 major 다. 가르면 안 쓰는 쪽은 설치를 안 해 0 바이트다
  (`docs/p1-boundary.md` 결정 4 개정).

### Patch Changes

- Updated dependencies [[`b4ee4db`](https://github.com/coldsurfers/public/commit/b4ee4db6d356406e66774388d083be92c130acfd)]:
  - @coldsurfers/design-system@0.12.0
