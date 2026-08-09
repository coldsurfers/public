/**
 * React primitives — Button · Chip · Badge · Field · Modal · …
 *
 * 아직 비어 있다 — 채우는 건 coldsurfers/paul-rockstar#220 의 P3(primitives 흡수).
 *
 *   packages/ui/src/primitives/*  → 여기
 *
 * ⚠️ **흡수에는 상한이 있다.** 시안 컨트롤 높이가 34/35/36/46/48 다섯 종이라 그대로 받으면
 *    `Button.size` 가 7종이 된다 — 그건 추상화가 아니라 목록이다. *한 컴포넌트가 어느 축까지
 *    먹고 어디부터 새 primitive 인가* 를 먼저 못박는다(#220 열린 결정 3). 공개 패키지에선
 *    그 규율이 곧 API 계약이다.
 *
 * 무엇이 들어오는가: 도메인 타입 · 라우터 · i18n 을 props/slot 으로 밀어낼 수 있고
 * 두 곳 이상에서 쓰이면 옮긴다. 한 곳뿐이면 두 번째 소비처가 생길 때까지 보류.
 */
export {}
