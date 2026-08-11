import { type CoverTone, cover } from './tokens'

/**
 * 포스터 없는 이벤트/아티스트의 커버 색면 톤 — `cover` 팔레트를 id 로 결정적 분산한다.
 *
 * 값이 아니라 *값을 고르는 방법* 이라 토큰 옆에 둔다. 도메인은 `id: string` 으로 이미
 * 밀려나 있어 이 함수는 무엇의 id 인지 모른다 — 그래서 옮길 수 있었다.
 * (표면을 라이트로 고정하는 정책은 반대로 앱에 남는다. docs/p1-boundary.md 결정 3)
 *
 * 순서를 손으로 적지 않고 팔레트에서 파생한다. 목록을 따로 들면 팔레트와 어긋날 수 있고,
 * 어긋난 순간 톤 분산이 조용히 달라진다.
 */
export const COVER_TONES = Object.keys(cover) as readonly CoverTone[]

export function coverToneFor(id: string): CoverTone {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % COVER_TONES.length
  return COVER_TONES[h]
}
