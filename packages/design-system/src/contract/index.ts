/**
 * 웹 · RN 두 구현이 **함께 지키는 계약**. `./primitives` 와 `./native` 가 같은 것이라고
 * 말하려면 무엇이 실제로 같아야 하는가 — 그 답을 여기 한 곳에 둔다.
 *
 * ## 공유선은 세 층에서 끊긴다
 *
 * | 층 | 무엇 | 여기 |
 * | --- | --- | --- |
 * | 타입 | `ButtonVariant` 같은 유니온 축 | ✅ 지금 |
 * | 값 | 축 → 치수·토큰키 표 (`BUTTON_SPEC`) | ✅ 들어올 자리 |
 * | 스타일 | VE recipe · emotion 객체 | ❌ 각 구현 |
 *
 * 스타일이 못 넘어오는 이유는 `native/index.ts` 에 적혀 있다 — VE 의 산출물은 CSS 문자열이고
 * RN 엔 그걸 받을 곳이 없다. **타입과 값까지가 실질 공유선이다.**
 *
 * 값 층이 성립하는 근거: 두 구현이 이미 같은 표현을 쓴다. 생 px 숫자(`height: 36`)이거나
 * 토큰 키(`vars.radius.md` ↔ `nativeRadius.md`)다. 표 하나를 두고 양쪽이 자기 토큰 맵으로
 * 해석하면 된다 — `tokens/native.ts` 가 이미 쓰는 기계 변환과 같은 수법이다.
 *
 * ## 배치가 컴포넌트별인 이유
 *
 * 타입과 값을 **층으로 갈라 두지 않는다.** `size: 'lg'` 를 늘리면 `BUTTON_SPEC.lg` 도 반드시
 * 같이 늘어야 하는데, 다른 파일에 있으면 한쪽만 늘려도 아무도 안 막는다 — 이 디렉터리가
 * 애초에 생긴 원인과 같은 종류의 사고다. 한 컴포넌트의 축과 그 축의 값은 한 파일에 둔다.
 *
 * ## 불변식
 *
 * - **이 트리에 `.css.ts` 가 없어야 한다.** 하나라도 들어오면 VE 가 굽고 RN 번들이 CSS 를 문다.
 *   같은 이유로 `../index` 도, `../primitives/*` 도 import 하지 않는다.
 * - **진입점으로 열지 않는다.** `exports` 맵에 오른 이름은 빼는 게 major 다. 두 배럴이 필요한
 *   이름을 재수출하고 `rollupTypes` 가 엔트리별 d.ts 로 말아 넣는다.
 * - **한쪽에만 있는 컴포넌트의 축은 올라오지 않는다.** 갈라질 상대가 없으면 계약이 아니다.
 * - **prop 인터페이스 전체를 올리지 않는다.** 웹은 `ButtonHTMLAttributes` 를, native 는
 *   `TouchableOpacityProps` 를 extends 한다 — 공통 조상이 없다. 억지로 만든 `BaseProps` 는
 *   웹의 `asChild` 와 native 의 `label` 이 갈 곳을 잃게 만든다.
 * - **토큰 타입·값을 올리지 않는다.** `tokens/` 가 정본이다.
 *
 * 축을 늘리는 순서는 그대로다 — 웹 구현부터 늘리고, 그다음 여기에 이름을 올린다.
 */
export type { ButtonSize, ButtonVariant } from './button'
export type { ToastTone } from './toast'
