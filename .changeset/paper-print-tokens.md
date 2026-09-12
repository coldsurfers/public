---
'@coldsurfers/paper': minor
---

인쇄 시맨틱 계약과 `coldsurf` 테마 파생.

- `src/tokens/contract.ts` — 테마가 채워야 하는 변수 26개. 접두는 `--print-` 다.
  DS 가 `--paper-*` 를 자기 네임스페이스로 쓰고 있어서, 같은 접두를 쓰면 한 이름이
  두 값을 가리키게 된다
- `build.mjs` — `@coldsurfers/design-system/tokens` 에서 테마 CSS 한 장을 굽는다.
  계약을 못 채웠거나 계약에 없는 걸 채우면 빌드가 깨진다. `var(--없는이름)` 은 색만
  조용히 비는데, 지면은 사람이 열어보기 전엔 그걸 아무도 모른다
- `src/css/` — `print`(지면 물리) · `prose`(마크다운 태그) · `components`(지면 조판).
  값은 전부 `var(--print-*)` 이고 하드코딩 hex 는 없다

DS 에 대응이 없는 값은 지어내지 않고 파생했다 — 인용면은 accent 를 지면에 섞고,
표지 색면은 cover scale 에서 하나를 고르는 대신 잉크를 쓴다. 링크만 예외로 `linkHover`
값을 정지 상태로 쓴다. 종이엔 hover 가 없어서 본문과 같은 색인 링크는 링크로 안 읽힌다.
