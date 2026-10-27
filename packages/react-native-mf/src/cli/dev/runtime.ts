/**
 * dev 번들의 기기 쪽. `./modules` 의 `buildRuntime` 이 이 파일을 esbuild 로 한 번 묶고, 서버는 그
 * 글자를 번들 앞에 싣는다. 호스트의 `new Function` 이 돌린다.
 *
 * 부팅하고 나면 hot 요청을 하나씩 이어 걸고, 받은 모듈을 갈아 끼운다. 기기가 어디까지 받았는지(커서)는
 * 여기에만 있다.
 *
 * Hermes 런타임 컴파일러가 받는 문법만 쓴다 — async · class · generator 가 없다. import 는 타입만
 * 한다. 묶은 글자에 Node 가 섞이면 기기에서 터진다.
 */
import type { Boot, ModuleId, ModuleSource, Reply, Stamp } from './wire'

/** RN dev 호스트가 전역에 거는 `__ReactRefresh`. 릴리스 호스트엔 없다 */
type Refresh = {
  register(type: unknown, id: string): void
  createSignatureFunctionForTransform(): (type?: unknown) => unknown
  isLikelyComponentType(type: unknown): boolean
  /** 등록한 적 없는 값이면 `undefined`. 같은 id 로 다시 등록한 새 함수는 같은 family 다 */
  getFamilyByType(type: unknown): unknown
  performReactRefresh(): void
  /** RN 은 `DevSettings.reload(reason)` 이다 */
  performFullRefresh(reason: string): void
}

/** 런타임이 만지는 전부. 번들은 `globalThis` 를, 테스트는 vm realm 의 전역을 넘긴다 */
type Host = {
  console: Pick<Console, 'warn' | 'error'>
  fetch(url: string): Promise<{ status: number; json(): Promise<unknown> }>
  setTimeout(callback: () => void, ms: number): unknown
  [key: string]: unknown
}

/**
 * 모듈 몸통을 감싼 함수. `$RefreshReg$` · `$RefreshSig$` 가 **매개변수**다. Metro 가 전역에 거는
 * no-op 이 잡히지 않고, react-refresh/babel 이 `_s = $RefreshSig$()` 를 맨 위로 올려도 바인딩이
 * 이미 있다.
 */
type Factory = (
  require: (id: string) => unknown,
  module: { exports: unknown },
  exports: unknown,
  $RefreshReg$: (type: unknown, local: string) => void,
  $RefreshSig$: () => (type?: unknown) => unknown,
) => void

type ModuleRecord = {
  code: string
  factory: Factory
  status: 'defined' | 'running' | 'ready' | 'failed'
  /** 마지막으로 끝까지 돈 값. 다시 돌다 던지면 이 값으로 돌아간다 */
  exports: unknown
  /** require 하는 순간 적는다 */
  importers: Set<ModuleId>
}

export function bootDevRemote(boot: Boot, host: Host): void {
  const shared = host[boot.keys.shared] as Record<string, unknown> | undefined
  const missing = boot.requires.filter((spec) => shared?.[spec] === undefined)
  if (missing.length > 0) throw notShared(missing)

  const prefix = (host.__METRO_GLOBAL_PREFIX__ as string | undefined) ?? ''
  const refresh = host[`${prefix}__ReactRefresh`] as Refresh | undefined
  if (!refresh) {
    host.console.warn(
      `[react-native-mf] "${boot.name}" dev 번들이 Fast Refresh 없는 호스트에서 돈다(릴리스 빌드?). 컴포넌트를 등록하지 않는다`,
    )
  }
  // 이름 앞에 원격 이름을 붙인다. 없으면 원격 B 를 올릴 때 지역 id 가 같은 원격 A 컴포넌트가 바뀐다
  const register = (id: ModuleId) =>
    refresh
      ? (type: unknown, local: string) => refresh.register(type, `${boot.name}:${id} ${local}`)
      : () => {}
  const signature = refresh
    ? () => refresh.createSignatureFunctionForTransform()
    : () => (type?: unknown) => type

  const records = new Map<string, ModuleRecord>()
  for (const [id, code] of boot.modules) {
    records.set(id, {
      code,
      factory: compile(id, code),
      status: 'defined',
      exports: undefined,
      importers: new Set(),
    })
  }

  function compile(id: ModuleId, code: string): Factory {
    const sourceURL = `${boot.sourceRoot}${id.replace(/^\.\//, '')}`
    return new Function(
      'require',
      'module',
      'exports',
      '$RefreshReg$',
      '$RefreshSig$',
      `${code}\n//# sourceURL=${sourceURL}`,
    ) as Factory
  }

  function load(spec: string, importer?: ModuleId): unknown {
    const record = records.get(spec)
    if (!record) {
      const found = shared?.[spec]
      if (found === undefined) throw notShared([spec])
      return found
    }
    if (importer) record.importers.add(importer)
    // 던진 모듈은 다음 적용이 다시 돌릴 때까지 마지막 성공 값을 준다. 한 적용에서 두 번 돌지 않는다
    if (record.status !== 'defined') return record.exports
    return run(spec as ModuleId, record)
  }

  function run(id: ModuleId, record: ModuleRecord): unknown {
    const lastGood = record.exports
    // 순환 import 는 도는 중인 exports 를 받는다. esbuild 의 CJS 는 맨 위에서 `module.exports` 를
    // 바꿔 끼우므로 그 대입이 바로 기록에 닿아야 한다
    const module = {
      get exports() {
        return record.exports
      },
      set exports(value: unknown) {
        record.exports = value
      },
    }
    record.exports = {}
    record.status = 'running'
    try {
      record.factory((spec) => load(spec, id), module, record.exports, register(id), signature)
      record.status = 'ready'
      return record.exports
    } catch (error) {
      record.status = 'failed'
      record.exports = lastGood
      throw error
    }
  }

  /**
   * 바뀐 모듈을 갈아 끼우고 그 위 refresh 경계까지 다시 돌린다. Metro 의 Fast Refresh 와 같은 규칙이다.
   *
   * 새 글자는 먼저 전부 함수로 묶는다. 하나라도 깨졌으면 아무것도 바꾸기 전에 던진다. 경계는 다시 돌기
   * 전 exports 로 판정한다. 경계 아래 모듈은 경계가 다시 돌며 require 할 때 새로 돌고, 경계 위는 돌지
   * 않는다 — 위에 쥔 옛 컴포넌트는 react-refresh 가 새 것으로 잇는다. 다시 돈 경계의 모양(내보낸 이름과
   * family)이 바뀌면 이을 수 없으니 그 importer 에서 한 번 더 오른다. 경계를 못 만나고 importer 가 없는
   * 모듈(엔트리)에 닿으면 호스트를 다시 띄운다.
   *
   * 다시 돌다 던진 모듈은 마지막 성공 값을 지키고, 그 적용은 refresh 를 부르지 않는다 — 화면이 마지막
   * 성공 코드에 머문다. 던진 모듈은 다음 적용이 바뀐 모듈과 함께 다시 걷는다. 같은 글자는 바뀐 모듈로
   * 치지 않으니 따로 걷지 않으면 원인을 다른 데서 고쳐도 다시 돌 길이 없다.
   */
  function apply(refresh: Refresh, incoming: readonly ModuleSource[], removed: readonly string[]) {
    const changed = incoming.filter(([id, code]) => records.get(id)?.code !== code)
    const gone = removed.filter((id) => records.has(id))
    const failed = [...records]
      .filter(([id, record]) => record.status === 'failed' && !gone.includes(id))
      .map(([id]) => id as ModuleId)
    if (changed.length === 0 && gone.length === 0 && failed.length === 0) return
    const factories = changed.map(([id, code]) => compile(id, code))

    for (const id of gone) {
      records.delete(id)
      for (const record of records.values()) record.importers.delete(id as ModuleId)
    }
    // 새 모듈과 아직 돈 적 없는 모듈은 오르지 않는다. 처음 require 될 때 새 글자로 돈다
    let from = [
      ...changed
        .map(([id]) => id)
        .filter((id) => (records.get(id)?.status ?? 'defined') !== 'defined'),
      ...failed,
    ]
    changed.forEach(([id, code], index) => {
      const record = records.get(id)
      if (record) {
        record.code = code
        record.factory = factories[index]
      } else {
        records.set(id, {
          code,
          factory: factories[index],
          status: 'defined',
          exports: undefined,
          importers: new Set(),
        })
      }
    })

    const fullRefresh = (id: ModuleId) =>
      refresh.performFullRefresh(
        `[react-native-mf] "${boot.name}" 의 ${id} 위로 Fast Refresh 경계가 없다`,
      )
    // 한 적용에서 모듈은 한 번만 걷는다. 앞서 다시 돈 모듈은 이미 새 exports 를 쥐었다
    const walked = new Set<ModuleId>()
    let threw = false
    while (from.length > 0) {
      const queue = from
      const roots: ModuleId[] = []
      while (queue.length > 0) {
        const id = queue.shift() as ModuleId
        if (walked.has(id)) continue
        walked.add(id)
        const record = records.get(id) as ModuleRecord
        if (isBoundary(refresh, record.exports)) {
          roots.push(id)
        } else if (record.importers.size === 0) {
          fullRefresh(id)
          return
        } else {
          queue.push(...record.importers)
        }
        record.status = 'defined'
      }

      const before = roots.map((id) => shape(refresh, (records.get(id) as ModuleRecord).exports))
      from = []
      for (const [index, id] of roots.entries()) {
        try {
          load(id)
        } catch (error) {
          threw = true
          host.console.error(
            `[react-native-mf] "${boot.name}" 의 ${id} 를 다시 돌리지 못했다. 고칠 때까지 마지막 성공 코드로 돈다`,
            error,
          )
          continue
        }
        const record = records.get(id) as ModuleRecord
        if (sameShape(before[index], shape(refresh, record.exports))) continue
        if (record.importers.size === 0) {
          fullRefresh(id)
          return
        }
        from.push(...record.importers)
      }
    }
    registry[boot.name] = load(boot.entry)
    if (!threw) refresh.performReactRefresh()
  }

  /**
   * hot 요청을 늘 하나만 걸어 둔다. 응답을 받으면 적용하고 곧바로 다시 건다.
   *
   * fetch 가 거절되면(서버가 꺼졌다) 그때마다 한 번 경고하고 250 ms 부터 두 배씩, 5 s 까지 물러난다.
   * 붙으면 처음으로 돌아간다.
   */
  function startClient(refresh: Refresh) {
    let have: Stamp = boot.stamp
    let seen: Stamp = boot.stamp
    let failures = 0
    const cursor = () => `have=${have.epoch}.${have.version}&seen=${seen.epoch}.${seen.version}`

    const receive = (reply: Reply) => {
      seen = reply.stamp
      // `have` 를 옮기지 않는다. 고친 뒤의 갱신이 그 사이 바뀐 모듈까지 싣는다
      if (reply.kind === 'error') {
        const errors = reply.errors.map(({ file, message }) =>
          file ? `${file}: ${message}` : message,
        )
        host.console.error(
          `[react-native-mf] "${boot.name}" 를 굽지 못했다. 고칠 때까지 마지막 성공 코드로 돈다\n\n${errors.join('\n\n')}`,
        )
        return
      }
      if (reply.kind === 'update') {
        apply(refresh, reply.modules, reply.removed)
      } else {
        const kept = new Set<string>(reply.modules.map(([id]) => id))
        apply(
          refresh,
          reply.modules,
          [...records.keys()].filter((id) => !kept.has(id)),
        )
      }
      have = reply.stamp
    }

    const poll = () => {
      host
        .fetch(`${boot.hotUrl}?${cursor()}`)
        .then((response) => {
          if (response.status === 204) return undefined
          if (response.status !== 200) throw new Error(`HTTP ${response.status}`)
          return response.json() as Promise<Reply>
        })
        .then(
          (reply) => {
            failures = 0
            if (reply) {
              try {
                receive(reply)
              } catch (error) {
                host.console.error(
                  `[react-native-mf] "${boot.name}" 에 v${reply.stamp.version} 을 적용하지 못했다`,
                  error,
                )
              }
            }
            poll()
          },
          (error: unknown) => {
            if (failures === 0) {
              host.console.warn(
                `[react-native-mf] "${boot.name}" dev 서버에서 갱신을 받지 못했다(${error instanceof Error ? error.message : String(error)}). 물러나며 다시 부른다`,
              )
            }
            host.setTimeout(poll, Math.min(5000, 250 * 2 ** failures))
            failures += 1
          },
        )
    }
    poll()
  }

  const registry = (host[boot.keys.registry] ?? {}) as Record<string, unknown>
  host[boot.keys.registry] = registry
  registry[boot.name] = load(boot.entry)
  if (refresh) startClient(refresh)
}

/**
 * 경계의 모양 — exports 자체와 내보낸 이름마다의 family. 다시 돈 뒤 이게 바뀌면(이름이 생기거나
 * 사라졌다, 같은 이름이 다른 컴포넌트가 됐다) 위에서 쥔 옛 값을 react-refresh 가 이어 주지 못한다.
 */
function shape(refresh: Refresh, exports: unknown): unknown[] {
  const own = [refresh.getFamilyByType(exports)]
  if (exports === null || typeof exports !== 'object') return own
  for (const name of Object.keys(exports)) {
    if (name === '__esModule') continue
    own.push(name, refresh.getFamilyByType((exports as Record<string, unknown>)[name]))
  }
  return own
}

const sameShape = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((part, index) => part === b[index])

/**
 * exports 가 컴포넌트뿐이면 경계다. esbuild 의 CJS exports 는 getter 라 값을 읽어 본다 — getter 는
 * 지역 바인딩을 돌려줄 뿐이다.
 */
function isBoundary(refresh: Refresh, exports: unknown): boolean {
  if (refresh.isLikelyComponentType(exports)) return true
  if (exports === null || typeof exports !== 'object') return false
  const names = Object.keys(exports).filter((name) => name !== '__esModule')
  return (
    names.length > 0 &&
    names.every((name) => refresh.isLikelyComponentType((exports as Record<string, unknown>)[name]))
  )
}

function notShared(specs: string[]): Error {
  const names = specs.map((spec) => `"${spec}"`).join(', ')
  return new Error(
    `[react-native-mf] shared 모듈 ${names} 이 등록돼 있지 않다. 호스트에서 registerShared() 로 먼저 노출한다.`,
  )
}
