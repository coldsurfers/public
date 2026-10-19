import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * 업로드처 계약. 읽기 · 쓰기 둘뿐이다 — 매니페스트를 고쳐 쓰고, 번들이 이미 있는지 본다.
 *
 * 없는 키는 `null` 이다. 던지면 배포가 멈춘다.
 */
export type DeployStorage = {
  read(key: string): Promise<string | null>
  write(
    key: string,
    body: string,
    meta: { contentType: string; cacheControl: string },
  ): Promise<void>
}

/** `build` 명령의 플래그와 같은 뜻이다. 경로는 미니앱 루트 기준 */
export type DeployBuildConfig = {
  outFile?: string
  src?: string
  entry?: string
  sharedFrom?: string
  shared?: string[]
  babelConfig?: string
  blockScoping?: boolean
}

export type DeployConfig = {
  /** 원격 이름. 번들이 이 이름으로 스스로 등록하고 저장소 경로에도 들어간다 */
  name: string
  /** 저장소 안 앞자리. `{prefix}/{name}/...` */
  prefix: string
  storage: DeployStorage
  build?: DeployBuildConfig
  /** 올리기 전 번들 검사. `allow` 는 앱에 실어도 되는 공개 값을 글자 그대로 적는다 */
  scan?: { allow?: string[] }
}

export function defineConfig(config: DeployConfig): DeployConfig {
  return config
}

/** Node 22.18+ 는 `.ts` 를 그대로 연다(type stripping). 그보다 낮으면 `.js` · `.mjs` 를 쓴다 */
export const CONFIG_FILES = [
  'react-native-mf.config.ts',
  'react-native-mf.config.mjs',
  'react-native-mf.config.js',
] as const

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function loadConfig(cwd: string, explicit?: string): Promise<DeployConfig> {
  const candidates = explicit ? [explicit] : CONFIG_FILES
  for (const candidate of candidates) {
    const path = resolve(cwd, candidate)
    if (!(await exists(path))) continue

    const module = (await import(pathToFileURL(path).href)) as { default?: DeployConfig }
    if (!module.default) {
      throw new Error(`[react-native-mf] ${candidate} 이 config 를 default export 하지 않는다.`)
    }
    return module.default
  }

  throw new Error(`[react-native-mf] config 를 찾을 수 없다(${cwd}): ${candidates.join(' · ')}`)
}
