/**
 * `Skeleton` 의 계약. 규율은 `./index.ts`.
 *
 * **prop 인터페이스는 올리지 않는다** — 웹은 `ComponentPropsWithRef<'div'>` 를, RN 은
 * `ViewProps` 를 extends 한다. 치수 축도 표현이 갈린다: 웹 `width` 는 임의 CSS 길이(`'5rem'`)를
 * 받지만 RN 은 `DimensionValue`(숫자 · `'80%'`)뿐이고, `aspectRatio` 는 웹이 문자열
 * (`'3 / 4'`) RN 이 숫자다. **좁혀서 옮긴 축이라 공통분이 아니다.**
 *
 * 그래서 여기 있는 건 두 구현이 같은 숫자를 써야 하는 것 — 맥동과 톤 알파뿐이다.
 */

/**
 * 바탕 두 톤. 값은 각자 토큰 맵에서 읽는다 — `neutral` 은 `surfaceHover`,
 * `onCover` 는 `paper.warm` 에 아래 알파를 먹인 것.
 *
 * `onCover` 가 따로 있는 이유: 어두운 커버 위의 텍스트 자리라 바닥 톤과 명도가 반대다.
 */
export type SkeletonTone = 'neutral' | 'onCover'

/**
 * 맥동 — 웹은 `css/motion.css.ts` 의 keyframes, RN 은 `Animated` 루프가 이 표를 읽는다.
 *
 * `reducedOpacity` 는 모션을 줄이는 설정에서 **맥동만 끄고 한 톤 죽인 정지 상태**로 두기
 * 위한 값이다. 애니메이션을 지우면서 불투명도까지 1 로 되돌리면 자리표시자가 실제 내용과
 * 구분되지 않는다 — "아직 안 왔다" 를 알리는 게 이 컴포넌트의 일이다.
 */
export const SKELETON_SPEC = {
  pulse: {
    /** 한 주기. 웹 `animationDuration: '2s'`. */
    durationMs: 2000,
    /** 주기 중간의 최저 불투명도. */
    minOpacity: 0.5,
    /** `cubic-bezier(0.4, 0, 0.6, 1)` — 웹 `animationTimingFunction` 과 같은 곡선. */
    easing: [0.4, 0, 0.6, 1],
    /** 모션 감소 설정에서 쓰는 정지 불투명도. */
    reducedOpacity: 0.6,
  },
  /** `onCover` 톤이 `paper.warm` 에 먹이는 알파(%). */
  onCoverAlpha: 25,
  /** 각진 바가 텍스트 줄의 기본 꼴이다. */
  defaultRadius: 'none',
} as const
