/**
 * [1.5] 스토리지 계약 — **저장만** 주입받는다.
 *
 * `fetch` 는 이 패키지가 들고, 디스크 접근만 소비처가 준다. 반대로 갈랐으면 여기가
 * `react-native-fs` 를 물어야 하는데, 그건 공개 패키지가 소비자에게 네이티브 모듈을
 * 강요하는 것이다 — 런타임 레인은 앱이 아무것도 더 깔지 않고 열려야 한다.
 *
 * 키는 **불투명 문자열**이다. 소비처는 이걸 파일 경로 하나로 바꾸기만 하면 된다
 * (`${DocumentDirectoryPath}/${key}`). 키 안에 뭐가 들었는지는 이 파일만 안다.
 */
export type ScriptStorage = {
  /** 없으면 `null`. 던지면 `load` 가 네트워크로 되돌아간다 — 캐시는 정본이 아니다 */
  read(key: string): Promise<string | null>
  write(key: string, content: string): Promise<void>
  remove(key: string): Promise<void>
  /** 지금 들고 있는 키 전부. `invalidate({ keep })` 가 지울 대상을 여기서 찾는다 */
  list(): Promise<string[]>
}

/**
 * 키에 버전을 박는 이유는 `invalidate` 하나다 — 지울 기준이 키 안에 없으면 소비처가
 * 파일 이름 규칙을 자기 쪽에서 다시 만들어야 하고, 그러면 규칙이 두 곳으로 갈린다.
 */
export function storageKey(name: string, version: string): string {
  return `${name}@${version}`
}

/**
 * 우리가 만들지 않은 키는 `null` 이다. `invalidate` 가 `list()` 결과를 훑을 때
 * **남의 파일을 지우지 않게** 하는 자리다 — 스토리지가 우리 전용이라는 보장이 없다.
 */
export function parseStorageKey(key: string): { name: string; version: string } | null {
  const at = key.lastIndexOf('@')
  if (at <= 0 || at === key.length - 1) return null

  return { name: key.slice(0, at), version: key.slice(at + 1) }
}
