/**
 * sprinkles 전용 진입점.
 *
 * 배럴(`.`)에 넣지 않는 이유는 무게다 — sprinkles 런타임은 조합 표를 통째로 들고 있어서,
 * `vars` 한 줄 쓰는 소비처까지 그걸 물게 된다. design-system 이 같은 이유로 갈라 뒀다.
 */
export { type Sprinkles, sprinkles } from './sprinkles.css'
