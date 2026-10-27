/**
 * dev 서버가 드는 상태 하나(`DevState`)와, 요청마다 그 상태에서 번들을 내는 길.
 *
 * 상태는 `commit` 만 바꾸고 굽기는 한 번에 하나만 돈다. 같은 굽기를 두 번 넣어도 상태도 버전도
 * 그대로고, 실패한 굽기는 모듈을 건드리지 않는다. 고친 뒤의 굽기가 따로 길을 갖지 않는다.
 */
import { REMOTE_REGISTRY_KEY } from '../../runtime/registry'
import { SHARED_SCOPE_KEY } from '../../runtime/shared-scope'
import { bundleText, type ModuleBuild, type PassError, type PassResult } from './modules'
import type { Boot, ModuleId } from './wire'

export type DevState = Readonly<{
  /** dev 프로세스마다 하나 */
  epoch: string
  /** 코드나 오류를 바꾸는 굽기마다 하나 오른다 */
  version: number
  requires: readonly string[]
  modules: ReadonlyMap<ModuleId, ModuleBuild & { changedAt: number }>
  removedAt: ReadonlyMap<ModuleId, number>
  /** 있으면 마지막 굽기가 실패했다. 번들은 500 이고, 그 밑에 마지막 성공 모듈이 그대로 있다 */
  errors: readonly PassError[] | undefined
}>

export const emptyState = (epoch: string): DevState => ({
  epoch,
  version: 0,
  requires: [],
  modules: new Map(),
  removedAt: new Map(),
  errors: undefined,
})

/**
 * 굽기 하나를 상태에 넣는다. 코드가 바뀌거나 · 모듈이 생기거나 지워지거나 · 오류가 생기거나 바뀌거나
 * 걷히면 버전이 한 번 오르고, 아니면 받은 상태를 그대로 돌려준다.
 */
export function commit(state: DevState, pass: PassResult): DevState {
  if (!pass.ok) {
    if (state.errors && sameErrors(state.errors, pass.errors)) return state
    return { ...state, version: state.version + 1, errors: pass.errors }
  }

  const version = state.version + 1
  let changed = state.errors !== undefined
  const modules = new Map<ModuleId, ModuleBuild & { changedAt: number }>()
  for (const [id, build] of pass.modules) {
    const before = state.modules.get(id)
    if (before && before.code === build.code) {
      modules.set(id, before)
    } else {
      modules.set(id, { ...build, changedAt: version })
      changed = true
    }
  }

  const removedAt = new Map(state.removedAt)
  for (const id of state.modules.keys()) {
    if (!pass.modules.has(id)) {
      removedAt.set(id, version)
      changed = true
    }
  }
  for (const id of pass.modules.keys()) removedAt.delete(id)

  if (!changed) return state
  return {
    epoch: state.epoch,
    version,
    requires: pass.requires,
    modules,
    removedAt,
    errors: undefined,
  }
}

function sameErrors(a: readonly PassError[], b: readonly PassError[]): boolean {
  return (
    a.length === b.length &&
    a.every((error, index) => error.file === b[index].file && error.message === b[index].message)
  )
}

/**
 * 칸이 둘인 큐. 도는 것(`running`)과 그다음(`next`).
 *
 * 부른 쪽은 **자기가 부른 뒤 시작한 한 번만** 받는다. 도는 중에 부른 쪽은 모두 `next` 하나를 나눠
 * 쓴다. 고친 뒤 리로드했는데 고치기 전 번들이 오는 일이 없고, 굽기가 겹쳐 돌지 않는다. 앞이 실패해도
 * 다음은 돈다.
 */
export function createLatestQueue<T>(task: () => Promise<T>): () => Promise<T> {
  let running: Promise<T> | undefined
  let next: Promise<T> | undefined

  const start = () => {
    const current = task()
    running = current
    const settle = () => {
      if (running === current) running = undefined
    }
    current.then(settle, settle)
    return current
  }
  const startNext = () => {
    next = undefined
    return start()
  }

  return () => {
    if (next) return next
    if (!running) return start()
    next = running.then(startNext, startNext)
    return next
  }
}

/** 요청 하나가 받는 굽기. 실패도 값이다. 응답과 터미널 로그가 같은 값에서 나온다 */
export type Bake =
  | { ok: true; code: string; ms: number }
  | { ok: false; message: string; ms: number }

export type DevSession = {
  /** 부른 뒤 시작한 굽기 하나를 기다려, `origin`(기기가 부른 주소)에 맞춘 번들을 낸다 */
  bundle(origin: string): Promise<Bake>
}

export function createDevSession(input: {
  name: string
  entry: ModuleId
  epoch: string
  compile: () => Promise<PassResult>
  /** 기기 런타임 글자. 첫 번들에서 한 번 부른다 */
  runtime: () => Promise<string>
}): DevSession {
  let state = emptyState(input.epoch)
  let runtime: Promise<string> | undefined

  const pass = createLatestQueue(async () => {
    const startedAt = performance.now()
    state = commit(state, await input.compile())
    return { state, startedAt }
  })

  const boot = (committed: DevState, origin: string): Boot => ({
    name: input.name,
    entry: input.entry,
    modules: [...committed.modules].map(([id, { code }]) => [id, code] as const),
    requires: [...committed.requires],
    sourceRoot: `${origin}/${input.name}/`,
    keys: { registry: REMOTE_REGISTRY_KEY, shared: SHARED_SCOPE_KEY },
  })

  return {
    async bundle(origin) {
      const calledAt = performance.now()
      try {
        const { state: committed, startedAt } = await pass()
        const ms = () => performance.now() - startedAt
        if (committed.errors) {
          const message = committed.errors
            .map(({ file, message }) => (file ? `${file}: ${message}` : message))
            .join('\n\n')
          return { ok: false, message, ms: ms() }
        }
        runtime ??= input.runtime()
        const code = bundleText(boot(committed, origin), await runtime)
        return { ok: true, code, ms: ms() }
      } catch (error) {
        // esbuild 를 못 여는 것처럼 파일에 매이지 않는 실패. 서버는 살고 다음 요청이 다시 굽는다
        const message = error instanceof Error ? error.message : String(error)
        return { ok: false, message, ms: performance.now() - calledAt }
      }
    },
  }
}
