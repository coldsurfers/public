/**
 * shared 목록을 **호스트에서 받아온다.**
 *
 * 어떤 모듈이 shared 인가는 호스트 앱의 사실이지 미니앱의 사실이 아니다(`shared-scope.ts` 가
 * 그은 선). 그런데 미니앱이 `--shared` 로 같은 목록을 또 적으면 정본이 둘이 되고, 둘은
 * 조용히 갈라진다 — 빠진 이름은 미니앱 번들에 **사본으로 딸려 들어가서** 로드는 되고 React 만
 * 둘이 된다.
 *
 * 그래서 호스트가 자기 레지스트리 키를 파일 하나로 내놓고, 미니앱은 **아무 목록도 들지 않는다.**
 *
 * ## 왜 키에서 이름을 파생하는가
 *
 * 두 자리가 쓰는 모양이 다르다.
 *
 * | | 모양 | 예 |
 * | --- | --- | --- |
 * | 호스트 등록·조회 | **정확한 specifier** | `@coldsurfers/design-system/native/Text` |
 * | 빌드 치환 필터 | **패키지 이름**(서브패스를 덮는다) | `@coldsurfers/design-system` |
 *
 * 후자는 전자의 순수 함수다 — 실제로 billets-app 의 키 27개에서 파생한 18개가 손으로 쓰던
 * 목록과 정확히 일치했다. 그러니 파생을 소비처에 시키지 않는다. 시키면 그 단계가 또 손작업이다.
 *
 * ## 덮는 쪽으로 파생하는 이유
 *
 * 정확 일치로만 치환하면, 호스트가 등록하지 않은 서브패스(`react-native/Libraries/...`)가
 * **조용히 번들에 들어간다.** 패키지 이름으로 덮으면 치환은 되고 조회 키가 없어서 로드 시점에
 * 그 이름을 대며 던진다 — 조용한 사본보다 시끄러운 실패가 낫다.
 */
import { readFile } from 'node:fs/promises'

/** `@scope/pkg/sub` → `@scope/pkg`, `pkg/sub` → `pkg` */
export function packageNameOf(specifier: string): string {
  const segments = specifier.split('/')
  return specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]
}

/** 호스트 레지스트리 키 → 치환 필터에 쓸 패키지 이름. 순서를 지키며 중복만 접는다. */
export function toSharedNames(keys: readonly string[]): string[] {
  return [...new Set(keys.map(packageNameOf))]
}

export function parseSharedManifest(text: string, path: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (cause) {
    throw new Error(`[react-native-mf] shared 매니페스트가 JSON 이 아니다: ${path}`, { cause })
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `[react-native-mf] shared 매니페스트는 호스트 레지스트리 키의 배열이어야 한다: ${path}`,
    )
  }

  const invalid = parsed.find((key) => typeof key !== 'string' || key.trim() === '')
  if (invalid !== undefined) {
    throw new Error(
      `[react-native-mf] shared 매니페스트에 문자열이 아닌 항목이 있다: ${JSON.stringify(invalid)}`,
    )
  }

  if (parsed.length === 0) {
    throw new Error(`[react-native-mf] shared 매니페스트가 비어 있다: ${path}`)
  }

  return toSharedNames(parsed as string[])
}

export async function readSharedManifest(path: string): Promise<string[]> {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (cause) {
    throw new Error(`[react-native-mf] shared 매니페스트를 읽을 수 없다: ${path}`, { cause })
  }

  return parseSharedManifest(text, path)
}
