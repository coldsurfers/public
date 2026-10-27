/**
 * dev 번들의 기기 쪽. `./modules` 의 `buildRuntime` 이 이 파일을 esbuild 로 한 번 묶고, 서버는 그
 * 글자를 번들 앞에 싣는다. 호스트의 `new Function` 이 돌린다.
 *
 * Hermes 런타임 컴파일러가 받는 문법만 쓴다 — async · class · generator 가 없다. import 는 타입만
 * 한다. 묶은 글자에 Node 가 섞이면 기기에서 터진다.
 */
import type { Boot, ModuleId } from './wire'

/** RN dev 호스트가 전역에 거는 `__ReactRefresh` 에서 이 단계가 쓰는 둘. 릴리스 호스트엔 없다 */
type Refresh = {
  register(type: unknown, id: string): void
  createSignatureFunctionForTransform(): (type?: unknown) => unknown
}

/** 런타임이 만지는 전부. 번들은 `globalThis` 를, 테스트는 vm realm 의 전역을 넘긴다 */
type Host = { console: Pick<Console, 'warn'>; [key: string]: unknown }

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
    const sourceURL = `${boot.sourceRoot}${id.replace(/^\.\//, '')}`
    records.set(id, {
      code,
      factory: new Function(
        'require',
        'module',
        'exports',
        '$RefreshReg$',
        '$RefreshSig$',
        `${code}\n//# sourceURL=${sourceURL}`,
      ) as Factory,
      status: 'defined',
      exports: undefined,
      importers: new Set(),
    })
  }

  function load(spec: string, importer?: ModuleId): unknown {
    const record = records.get(spec)
    if (!record) {
      const found = shared?.[spec]
      if (found === undefined) throw notShared([spec])
      return found
    }
    if (importer) record.importers.add(importer)
    if (record.status === 'ready' || record.status === 'running') return record.exports
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

  const registry = (host[boot.keys.registry] ?? {}) as Record<string, unknown>
  host[boot.keys.registry] = registry
  registry[boot.name] = load(boot.entry)
}

function notShared(specs: string[]): Error {
  const names = specs.map((spec) => `"${spec}"`).join(', ')
  return new Error(
    `[react-native-mf] shared 모듈 ${names} 이 등록돼 있지 않다. 호스트에서 registerShared() 로 먼저 노출한다.`,
  )
}
