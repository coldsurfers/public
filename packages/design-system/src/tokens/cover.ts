import { type CoverTone, cover, type NodeTone, nodeTone } from './tokens'

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

/**
 * 아티스트 노드 톤 — `nodeTone` 을 이름으로 결정적 분산한다. `coverToneFor` 의 형제.
 *
 * 해시가 `coverToneFor`(문자코드 누적)와 **다르다** — 이쪽은 `h * 31 + code` 다. 값 출처였던
 * `apps/web-next` 의 구현을 그대로 옮겼기 때문이고, 바꾸면 이미 노출된 화면의 색 배치가
 * 통째로 달라진다. 두 함수를 통일하고 싶으면 그건 시각 변경으로 따로 다룬다.
 */
/**
 * 커버 색면이 **실제로 서는** 톤 — 팔레트 6톤 + 기다림의 면 `note`.
 *
 * `cover` 팔레트에 키를 더하지 않는다. `coverToneFor` 가 `Object.keys` **순서**로 분산하므로
 * 키가 하나 늘면 이미 발행된 모든 이벤트의 커버색이 재배치된다(`tokens.cover` 의 ⚠️).
 * `note` 는 애초에 분산 축에 있을 이유도 없다 — 데이터로 고르는 표지색이 아니라 **상태의 면**이다.
 *
 * 어떤 상태냐: **아직 그림이 없다.** 이미지가 오는 중이거나, 없거나, 실패했다. 그 셋은
 * `Skeleton`(API 대기)과 같은 밝기여야 한다 — 기다림이 두 밝기로 갈리면 화면이 무거워진다.
 * 값은 두 구현이 각자 자기 축에서 읽는다(웹 `vars.color.surfaceHover` · native
 * `nativeColor.light.surfaceHover`). `cover` 팔레트를 웹은 `vars.cover.*`, native 는 `cover`
 * 객체로 읽는 것과 같은 규율이라 여기서 값을 한 번 더 적지 않는다.
 */
export type CoverSurfaceTone = CoverTone | 'note'

export const NODE_TONES = Object.keys(nodeTone) as readonly NodeTone[]

export function nodeToneFor(name: string): NodeTone {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return NODE_TONES[h % NODE_TONES.length]
}
