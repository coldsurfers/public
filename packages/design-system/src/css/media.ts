import { breakpoints } from '../tokens'

/**
 * `.css.ts` 의 `'@media'` 키에 넣을 **미디어 쿼리 문자열**. 값의 SSOT 는 여기가 아니라
 * `../tokens` 의 `breakpoints`(mobile 480 · tablet 768 · desktop 1024) 다 —
 * 이 파일이 갖는 건 *그 px 을 쿼리 문법으로 감싸는 한 가지 방법*이다.
 *
 * VE 가 처리할 게 없는 평범한 `.ts` 다(클래스가 아니라 문자열). 그래서 배럴에서 그대로 내보낸다 —
 * `matchMedia` 로 판정하는 런타임 코드가 VE 를 물지 않고 같은 경계를 쓸 수 있어야
 * 숫자 복제가 안 생긴다.
 *
 * ```ts
 * '@media': { [media.tablet]: { gap: 13 } }
 * ```
 *
 * **min-width 단방향뿐이다.** 토큰 축이 mobile-first 라 `max` 방향을 미리 만들지 않는다.
 */
export const media = {
  mobile: `screen and (min-width: ${breakpoints.mobile})`,
  tablet: `screen and (min-width: ${breakpoints.tablet})`,
  desktop: `screen and (min-width: ${breakpoints.desktop})`,
} as const
