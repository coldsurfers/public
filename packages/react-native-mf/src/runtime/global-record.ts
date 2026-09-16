/**
 * 전역에 걸리는 레코드 하나를 **지연 생성**해서 돌려준다.
 *
 * `registry` 와 `shared-scope` 가 같은 모양이다 — 전역 키 하나, 없으면 만들고 있으면 그대로.
 * 두 파일이 각자 들고 있었더니 존재 판정이 갈렸다(`in` ↔ `!== undefined`). 지금 데이터로는
 * 둘 다 맞게 동작했지만 그건 self-register footer 가 `undefined` 를 안 넣기 때문이지
 * 규칙이 같아서가 아니었다. 식을 한 곳에 두면 갈릴 자리가 없다.
 *
 * **지연 생성인 이유**: 호스트 부트 순서가 정해져 있지 않다. 원격 번들이 먼저 실행돼
 * 레지스트리를 만들 수도, 호스트가 먼저 `registerShared` 할 수도 있다 — 먼저 부르는 쪽이 만든다.
 */
export function globalRecord<T>(key: string): () => Record<string, T> {
  const ref = globalThis as typeof globalThis & { [k: string]: Record<string, T> | undefined }

  return () => {
    const existing = ref[key]
    if (existing) return existing
    const created: Record<string, T> = {}
    ref[key] = created
    return created
  }
}
