import { getRemote } from './registry'
import { parseStorageKey, type ScriptStorage, storageKey } from './script-storage'

/**
 * [1.5] 로더 표면 — 원격 번들을 받아 실행하는 일을 **React 밖으로** 뺀다.
 *
 * 이전 소비처(`use-load-remote-app.ts`)는 이 일을 `useQuery` 둘로 했다. 그래서 세 가지가 묶였다:
 *
 *  1. **실행이 캐시 데이터로 잡혔다.** 번들 실행은 전역 레지스트리를 건드리는 부수효과인데
 *     `queryFn` 의 반환값이었다 — `refetch()` 가 번들을 **다시 실행**했고, 미니앱 top-level 의
 *     `new QueryClient` · `new AuthClient` 가 중복 생성됐다
 *  2. 로딩이 마운트에 묶여 부팅 프리페치 · 탭 진입 전 프리로드가 불가능했다
 *  3. 중복 방지를 queryKey 에 맡겨서, 레지스트리에 이미 올라와 있어도 다시 받았다
 *
 * 표면은 Re.Pack 의 `ScriptManager` 를 그대로 빌렸다. 나중에 갈아탈 때 소비처가 안 바뀐다.
 */

export type ScriptLocator = {
  /** 번들을 받을 곳. 실패한 실행의 `sourceURL` 로도 이 값이 쓰인다 */
  url: string
  /** 캐시 키에 박힌다. **없으면 캐시하지 않는다** — 지울 기준이 없는 걸 디스크에 남기지 않는다 */
  version?: string
  /** 기본 `true`. dev 레인처럼 매번 새로 받아야 하면 `false` */
  cache?: boolean
}

/** 못 맡을 이름이면 `undefined` 를 돌려준다 — 다음 resolver 가 받는다. */
export type ScriptResolver = (
  name: string,
) => ScriptLocator | undefined | Promise<ScriptLocator | undefined>

export type InvalidateOptions = {
  /** 남길 버전들. 나머지는 지운다 */
  keep: string[]
  /** 이 이름의 캐시만 훑는다. 생략하면 스토리지 전체 */
  name?: string
}

export type ScriptManager = {
  /** 등록 순서대로 물어보고 **처음 locator 를 주는 쪽**이 이긴다. 반환값을 부르면 뗀다 */
  addResolver(resolver: ScriptResolver): () => void
  /** `null` 이면 캐시 없이 매번 받는다 */
  setStorage(storage: ScriptStorage | null): void
  load<T = unknown>(name: string): Promise<T>
  prefetch(name: string): Promise<void>
  /** 지운 키들을 돌려준다 */
  invalidate(options: InvalidateOptions): Promise<string[]>
}

type Downloaded = {
  locator: ScriptLocator
  source: string
}

/**
 * 진행 중인 약속을 이름으로 접는다. **정착하면 지운다** — 실패를 기억하면 `retry` 가
 * 같은 실패를 되돌려주게 된다.
 */
function share<T>(pending: Map<string, Promise<T>>, name: string, start: () => Promise<T>) {
  const running = pending.get(name)
  if (running) return running

  const promise = start().finally(() => {
    pending.delete(name)
  })
  pending.set(name, promise)

  return promise
}

export function createScriptManager(init: { storage?: ScriptStorage } = {}): ScriptManager {
  const resolvers: ScriptResolver[] = []
  // 두 겹이다. 아래는 네트워크·디스크를, 위는 **실행**을 접는다. 아래만 있으면 동시 `load` 둘이
  // 같은 소스를 받아 각자 실행해서 증상 1번이 그대로 재현된다.
  const downloads = new Map<string, Promise<Downloaded>>()
  const loads = new Map<string, Promise<unknown>>()
  let storage = init.storage ?? null

  async function resolve(name: string): Promise<ScriptLocator> {
    for (const resolver of resolvers) {
      const locator = await resolver(name)
      if (locator) return locator
    }

    throw new Error(
      `[react-native-mf] "${name}" 을 맡는 resolver 가 없다. scriptManager.addResolver() 로 먼저 등록한다.`,
    )
  }

  /** 캐시를 쓸 키. `null` 이면 이번 로드는 디스크를 아예 안 만진다. */
  function cacheKeyOf(name: string, locator: ScriptLocator): string | null {
    if (locator.cache === false || !locator.version) return null

    return storageKey(name, locator.version)
  }

  async function download(name: string): Promise<Downloaded> {
    const locator = await resolve(name)
    const key = cacheKeyOf(name, locator)

    if (storage && key) {
      // 캐시는 최적화지 정본이 아니다. 읽다 깨지면 네트워크로 되돌아가는 게 맞다
      const cached = await storage.read(key).catch(() => null)
      if (cached !== null) return { locator, source: cached }
    }

    const response = await fetch(locator.url)
    if (!response.ok) {
      throw new Error(
        `[react-native-mf] "${name}" 번들을 받지 못했다 (${response.status} ${locator.url}).`,
      )
    }
    const source = await response.text()

    if (storage && key) {
      // 쓰기 실패로 로드를 깨지 않는다 — 소스는 이미 손에 있다. 다음 부팅에 다시 받을 뿐이다
      await storage.write(key, source).catch(() => undefined)
    }

    return { locator, source }
  }

  /**
   * 번들은 iife 라 **실행만 하면 스스로** 레지스트리에 오른다 — `require` 를 주입하지 않는다.
   * shared 모듈은 빌드타임에 이미 글로벌 참조로 치환돼 있다([1] shared scope).
   *
   * `sourceURL` 은 캐시에서 읽었을 때도 원격 URL 을 쓴다. 디버거가 무엇을 열어야 하는지는
   * 소스가 지금 어디 있었는가가 아니라 **어디서 왔는가**다.
   */
  function evaluate<T>(name: string, { locator, source }: Downloaded): T {
    const execute = new Function(`${source}\n//# sourceURL=${locator.url}`)
    execute()

    const remote = getRemote<T>(name)
    if (remote === undefined) {
      throw new Error(
        `[react-native-mf] 실행한 번들이 "${name}" 으로 등록되지 않았다. 빌드의 --name 이 회수하는 이름과 같은지 확인한다.`,
      )
    }

    return remote
  }

  return {
    addResolver(resolver) {
      resolvers.push(resolver)

      return () => {
        const at = resolvers.indexOf(resolver)
        if (at >= 0) resolvers.splice(at, 1)
      }
    },

    setStorage(next) {
      storage = next
    },

    /**
     * **이미 레지스트리에 있으면 재실행하지 않는다.** 두 번째 실행은 미니앱 top-level 의
     * `new QueryClient` · `new AuthClient` 를 다시 만든다 — 그게 증상 1번이다.
     */
    load<T>(name: string): Promise<T> {
      const already = getRemote<T>(name)
      if (already !== undefined) return Promise.resolve(already)

      return share(loads, name, async () => {
        const downloaded = await share(downloads, name, () => download(name))

        // 받는 사이에 다른 경로로 실행됐을 수 있다. 실행 직전에 한 번 더 본다
        const meanwhile = getRemote<T>(name)
        if (meanwhile !== undefined) return meanwhile

        return evaluate<T>(name, downloaded)
      }) as Promise<T>
    },

    /**
     * 디스크까지만 데운다 — **실행하지 않는다.** 실행은 미니앱 top-level 을 도는 일이라
     * `prefetch` 라는 이름 뒤에 숨길 게 아니다. 실행까지 미리 하고 싶으면 `load` 가 그 자리고,
     * 둘은 같은 다운로드를 접는다.
     *
     * `cache: false` 인 locator 에겐 하는 일이 없다 — 받아서 버린다.
     */
    async prefetch(name: string): Promise<void> {
      if (getRemote(name) !== undefined) return

      await share(downloads, name, () => download(name))
    },

    /**
     * **디스크만 비운다.** 이미 실행된 번들은 되돌릴 수 없다 — JS 런타임에 올라간 모듈을
     * 내리는 방법이 없다. 새 버전은 다음 부팅에 실행된다.
     *
     * ⚠️ `name` 을 생략하면 스토리지 전체를 훑는다. 미니앱이 여럿이고 버전이 서로 다르면
     * 한쪽 버전 목록으로 다른 쪽을 지우게 된다 — 그럴 땐 `name` 을 준다.
     */
    async invalidate({ keep, name }: InvalidateOptions): Promise<string[]> {
      if (!storage) return []

      const removed: string[] = []
      for (const key of await storage.list()) {
        const parsed = parseStorageKey(key)
        if (!parsed) continue
        if (name && parsed.name !== name) continue
        if (keep.includes(parsed.version)) continue

        await storage.remove(key)
        removed.push(key)
      }

      return removed
    },
  }
}

/**
 * 호스트에 하나면 된다 — 레지스트리와 달리 이 표면을 부르는 건 호스트뿐이라
 * 전역에 걸 이유가 없다. 테스트처럼 격리가 필요한 자리는 `createScriptManager()` 를 쓴다.
 */
export const scriptManager: ScriptManager = createScriptManager()
