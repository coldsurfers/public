/**
 * dev 서버가 드는 상태 하나(`DevState`)와, 그 상태에서 번들과 hot 응답을 내는 길.
 *
 * 상태는 `commit` 만 바꾸고 굽기는 한 번에 하나만 돈다. 같은 굽기를 두 번 넣어도 상태도 버전도
 * 그대로고, 실패한 굽기는 모듈을 건드리지 않는다. 고친 뒤의 굽기가 따로 길을 갖지 않는다.
 *
 * 기기마다 무엇을 보냈는지는 적지 않는다. 기기가 커서를 들고 오고, 답은 `answer(state, cursor)` 다.
 */
import { segment } from '../../manifest'
import { REMOTE_REGISTRY_KEY } from '../../runtime/registry'
import { SHARED_SCOPE_KEY } from '../../runtime/shared-scope'
import { bundleText, type ModuleBuild, type PassError, type PassResult } from './modules'
import type { Boot, Cursor, ModuleId, ModuleSource, Reply, Stamp } from './wire'

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
 * 기기가 받을 것. `undefined` 면 붙든다.
 *
 * 아직 넣은 굽기가 없는 상태(v0)는 붙든다. 서버를 다시 띄운 직후 빈 상태로 스냅숏을 내면 기기가
 * 모듈을 전부 지운다. 오류가 있는 동안도 붙든다 — 기기는 마지막 성공 코드로 계속 돈다.
 */
export function answer(state: DevState, cursor: Cursor): Reply | undefined {
  if (state.version === 0 || state.errors) return undefined
  const stamp: Stamp = { epoch: state.epoch, version: state.version }
  if (cursor.seen.epoch === stamp.epoch && cursor.seen.version === stamp.version) return undefined

  const since = (version: number): ModuleSource[] =>
    [...state.modules]
      .filter(([, { changedAt }]) => changedAt > version)
      .map(([id, { code }]) => [id, code])
  if (cursor.have.epoch !== state.epoch) return { kind: 'snapshot', stamp, modules: since(0) }
  return {
    kind: 'update',
    stamp,
    modules: since(cursor.have.version),
    removed: [...state.removedAt].filter(([, at]) => at > cursor.have.version).map(([id]) => id),
  }
}

/** 서버가 내는 epoch 은 `Date.now().toString(36)` 이다 */
const STAMP = /^([0-9a-z]+)\.(0|[1-9][0-9]*)$/

/** `have=<epoch>.<version>&seen=<epoch>.<version>`. 그 밖은 `undefined` 다 */
export function parseCursor(query: URLSearchParams): Cursor | undefined {
  const have = parseStamp(query.get('have'))
  const seen = parseStamp(query.get('seen'))
  return have && seen ? { have, seen } : undefined
}

function parseStamp(value: string | null): Stamp | undefined {
  const match = STAMP.exec(value ?? '')
  if (!match) return undefined
  const version = Number(match[2])
  return Number.isSafeInteger(version) ? { epoch: match[1], version } : undefined
}

/** `/settings/hot`. 번들 경로와 같은 이름 규칙이다 */
export const hotPath = (name: string) => `/${segment(name, 'name')}/hot`

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
  | { ok: true; code: string; ms: number; version: number }
  | { ok: false; message: string; ms: number }

export type DevSession = {
  /** 부른 뒤 시작한 굽기 하나를 기다려, `origin`(기기가 부른 주소)에 맞춘 번들을 낸다 */
  bundle(origin: string): Promise<Bake>
  /** 커서에 줄 것이 생길 때까지 붙든다. `timeoutMs` 가 지나도 없으면 `undefined` 다 */
  next(cursor: Cursor, timeoutMs: number): Promise<Reply | undefined>
  /** 소스가 바뀌었다는 신호. 굽기가 도는 중이면 그다음 굽기 하나로 모인다 */
  changed(): void
  /** 붙든 요청을 전부 `undefined` 로 놓는다 */
  close(): void
}

type Parked = {
  cursor: Cursor
  resolve: (reply: Reply | undefined) => void
  timer: ReturnType<typeof setTimeout>
}

export function createDevSession(input: {
  name: string
  entry: ModuleId
  epoch: string
  compile: () => Promise<PassResult>
  /** 기기 런타임 글자. 첫 번들에서 한 번 부른다 */
  runtime: () => Promise<string>
  /** 상태를 바꾼 굽기마다 한 줄 */
  log: (line: string) => void
}): DevSession {
  let state = emptyState(input.epoch)
  let runtime: Promise<string> | undefined
  const parked = new Set<Parked>()

  const release = (entry: Parked, reply: Reply | undefined) => {
    clearTimeout(entry.timer)
    parked.delete(entry)
    entry.resolve(reply)
  }

  const pass = createLatestQueue(async () => {
    const startedAt = performance.now()
    const before = state
    state = commit(before, await input.compile())
    if (state !== before) {
      input.log(describeCommit(state, performance.now() - startedAt))
      for (const entry of parked) {
        const reply = answer(state, entry.cursor)
        if (reply) release(entry, reply)
      }
    }
    return { state, startedAt }
  })

  const boot = (committed: DevState, origin: string): Boot => ({
    name: input.name,
    entry: input.entry,
    stamp: { epoch: committed.epoch, version: committed.version },
    modules: [...committed.modules].map(([id, { code }]) => [id, code] as const),
    requires: [...committed.requires],
    sourceRoot: `${origin}/${input.name}/`,
    hotUrl: `${origin}${hotPath(input.name)}`,
    keys: { registry: REMOTE_REGISTRY_KEY, shared: SHARED_SCOPE_KEY },
  })

  return {
    async bundle(origin) {
      const calledAt = performance.now()
      try {
        const { state: committed, startedAt } = await pass()
        const ms = () => performance.now() - startedAt
        if (committed.errors)
          return { ok: false, message: formatErrors(committed.errors), ms: ms() }
        runtime ??= input.runtime()
        const code = bundleText(boot(committed, origin), await runtime)
        return { ok: true, code, ms: ms(), version: committed.version }
      } catch (error) {
        // esbuild 를 못 여는 것처럼 파일에 매이지 않는 실패. 서버는 살고 다음 요청이 다시 굽는다
        return { ok: false, message: messageOf(error), ms: performance.now() - calledAt }
      }
    },

    next(cursor, timeoutMs) {
      const reply = answer(state, cursor)
      if (reply) return Promise.resolve(reply)
      return new Promise((resolve) => {
        const entry: Parked = {
          cursor,
          resolve,
          timer: setTimeout(() => release(entry, undefined), timeoutMs),
        }
        parked.add(entry)
      })
    },

    changed() {
      pass().catch((error: unknown) => input.log(`굽지 못했다 · ${messageOf(error)}`))
    },

    close() {
      for (const entry of parked) release(entry, undefined)
    },
  }
}

/** `v3 · settings-menu-list/settings-menu-list.tsx · 19 ms`. 넷 이상이면 개수만 적는다 */
function describeCommit(state: DevState, ms: number): string {
  const took = `${Math.round(ms)} ms`
  if (state.errors)
    return `v${state.version} · 굽지 못했다 · ${took}\n${formatErrors(state.errors)}`
  const shown = (id: ModuleId) => id.replace(/^\.\//, '')
  const names = [
    ...[...state.modules].filter(([, m]) => m.changedAt === state.version).map(([id]) => shown(id)),
    ...[...state.removedAt]
      .filter(([, at]) => at === state.version)
      .map(([id]) => `${shown(id)} 지움`),
  ]
  const what =
    names.length === 0
      ? '오류를 걷었다'
      : names.length <= 3
        ? names.join(', ')
        : `모듈 ${names.length}개`
  return `v${state.version} · ${what} · ${took}`
}

const formatErrors = (errors: readonly PassError[]) =>
  errors.map(({ file, message }) => (file ? `${file}: ${message}` : message)).join('\n\n')

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))
