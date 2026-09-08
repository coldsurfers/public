/**
 * `min`~`max` 사이의 정수를 반환한다(양끝 포함).
 *
 * 소수를 받으면 `min` 은 올리고 `max` 는 내려 범위 안에 가둔다.
 */
export function getRandomInt(minimum: number, maximum: number) {
  const min = Math.ceil(minimum)
  const max = Math.floor(maximum)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
