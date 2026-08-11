/**
 * 토큰 **값**의 SSOT. React 도 VE 도 물지 않는 순수 데이터라 서브패스로 따로 연다.
 *
 * 여기가 갖는 건 셋이다:
 *   - 값 — `tokens` 와 스케일들(`spacing`·`fontSize`·`cover`·…)
 *   - 이름 규칙 — `tokenVarName`·`cssVarPrefix`·`cssVarName`. 소비 레포의 codegen 이 읽는다
 *   - 팔레트에서 파생되는 선택 함수 — `coverToneFor`
 *
 * CSS 를 만들지 않는다. 변수 발행은 `../css/theme.css.ts` 가 하고, Tailwind `@theme` 같은
 * 소비처 전용 산출물은 아예 이 패키지 밖이다(docs/p1-boundary.md 결정 4).
 */
export { COVER_TONES, coverToneFor } from './cover'
export * from './tokens'
