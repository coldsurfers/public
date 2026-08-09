/**
 * 토큰 **값**의 SSOT. React 도 VE 도 물지 않는 순수 데이터라 서브패스로 따로 연다.
 *
 * 아직 비어 있다 — 채우는 건 coldsurfers/paul-rockstar#220 의 P2(병합).
 *
 *   packages/tokens/src/tokens.ts    → 여기
 *   packages/tokens/src/generate.ts  → CSS 변수 발행. 병합 후에도 codegen 이 필요한지는
 *                                      P2 에서 정한다 — contract 소비처가 1곳이 되면
 *                                      `createGlobalTheme` 하나로 접힐 수 있다.
 *
 * ⚠️ 브랜드 값(accent #d6451f · paper.warm · cover 6톤)을 소비자가 갈아끼울 수 있게
 *    열지 고정할지는 #220 열린 결정 1 — 아직 안 정해졌다.
 */
export {}
