/**
 * v4 UUID. `crypto.randomUUID` 가 없는 환경(구형 WebView·비보안 컨텍스트)까지 커버한다.
 *
 * 시각(`Date.now`)과 `performance.now` 를 시드에 섞어 같은 밀리초에 여러 개를 뽑아도 갈리게 한다.
 * 암호학적 난수가 아니다 — 토큰·키에 쓰지 않는다.
 *
 * 출처: Public Domain/MIT.
 */
export function generateUUID() {
  let d = Date.now()
  // 페이지 로드 이후 마이크로초. 미지원 환경이면 0.
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16
    if (d > 0) {
      // 타임스탬프를 다 쓸 때까지 먼저 소진.
      r = ((d + r) % 16) | 0
      d = Math.floor(d / 16)
    } else {
      r = ((d2 + r) % 16) | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
