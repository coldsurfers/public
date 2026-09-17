/**
 * `build` 의 인자 파싱. **실행과 가른 이유는 테스트다** — 플래그 해석은 esbuild·babel 없이
 * 판정할 수 있어야 하고, 실제로 `run(['build'])` 가 필수 옵션 없이 실패하는 경로는 그 둘을
 * 로드하기 전에 끝난다.
 *
 * 파서를 직접 쓴다. commander 를 물면 **런타임 레인만 쓰는 앱까지** 그 의존을 문다 —
 * 이 패키지가 `dependencies` 를 하나도 안 갖는 선을 플래그 일곱 개 때문에 깨지 않는다.
 */
import { DEFAULT_SHARED_MODULES } from '../esbuild/shared-scope'

export type BuildOptions = {
  /** 미니앱 루트. CLI 는 `process.cwd()`, 테스트는 임시 프로젝트를 넣는다 */
  cwd: string
  /** `cwd` 기준 소스 디렉터리 */
  src: string
  /** `src` 기준 엔트리 파일 */
  entry: string
  /** `cwd` 기준 산출물 경로 */
  outFile: string
  /** 원격 이름. 번들이 이 이름으로 스스로 등록하고 호스트가 같은 이름으로 회수한다 */
  name: string
  /** shared scope 로 치환할 모듈 이름 */
  shared: readonly string[]
  /** 미니앱 babel config 경로. 생략하면 babel 이 `cwd` 에서 찾는다 */
  babelConfig?: string
  /** Hermes 용 block-scoping 후처리를 돌릴지 */
  blockScoping: boolean
}

/**
 * `sharedFrom` 을 `BuildOptions` 안이 아니라 **형제로** 둔다. 매니페스트를 읽는 건 I/O 라
 * 파서가 못 하고, `runBuild` 는 이미 해결된 `shared` 만 봐야 한다 — 미해결 상태를 타입에
 * 들여놓으면 빌더가 그걸 매번 판정해야 한다.
 */
export type ParseResult =
  | { ok: true; options: BuildOptions; sharedFrom?: string }
  | { ok: false; error: string }

type ValueKey = 'src' | 'entry' | 'outFile' | 'name' | 'babelConfig' | 'shared' | 'sharedFrom'

const VALUE_FLAGS = new Map<string, ValueKey>([
  ['--src', 'src'],
  ['--entry', 'entry'],
  ['--out-file', 'outFile'],
  ['-o', 'outFile'],
  ['--name', 'name'],
  ['-n', 'name'],
  ['--babel-config', 'babelConfig'],
  ['--shared', 'shared'],
  ['--shared-from', 'sharedFrom'],
])

/**
 * `--shared` 는 **직접 적는 쪽**이다. 반복(`--shared react --shared react-native`)과
 * 쉼표(`--shared react,react-native`) 둘 다 받는다 — 패키지 이름에 쉼표가 못 들어가서 갈라도
 * 안전하다.
 *
 * ⚠️ 호스트가 있는 미니앱이라면 `--shared-from` 을 쓴다. 목록을 손으로 적는 순간 호스트 쪽
 * 목록과 정본이 둘이 되고, 갈라진 자리는 **조용히 사본으로** 나타난다(`shared-manifest.ts`).
 */
function collectShared(value: string, into: string[]): void {
  for (const name of value.split(',')) {
    const trimmed = name.trim()
    if (trimmed) into.push(trimmed)
  }
}

export function parseBuildOptions(argv: readonly string[], cwd: string): ParseResult {
  const values = new Map<ValueKey, string>()
  const shared: string[] = []
  let blockScoping = true

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    const separator = token.indexOf('=')
    const flag = separator === -1 ? token : token.slice(0, separator)
    const inline = separator === -1 ? undefined : token.slice(separator + 1)

    if (flag === '--no-block-scoping') {
      blockScoping = false
      continue
    }

    const key = VALUE_FLAGS.get(flag)
    if (!key) return { ok: false, error: `알 수 없는 옵션 "${flag}"` }

    // `--flag value` 와 `--flag=value` 둘 다 받는다. 값이 비면 다음 플래그를 값으로
    // 삼켜버리므로 여기서 끊는다.
    const value = inline ?? argv[index + 1]
    if (!value || (inline === undefined && value.startsWith('-'))) {
      return { ok: false, error: `"${flag}" 에 값이 없다` }
    }
    if (inline === undefined) index += 1

    if (key === 'shared') collectShared(value, shared)
    else values.set(key, value)
  }

  const outFile = values.get('outFile')
  if (!outFile) return { ok: false, error: '-o, --out-file 이 필요하다' }

  const name = values.get('name')
  if (!name) return { ok: false, error: '-n, --name 이 필요하다' }

  // 정본을 하나로 모으려고 매니페스트를 여는 것이다. 둘을 같이 받으면 그 목적이 사라진다.
  const sharedFrom = values.get('sharedFrom')
  if (sharedFrom && shared.length > 0) {
    return { ok: false, error: '--shared 와 --shared-from 은 같이 쓸 수 없다' }
  }

  return {
    ok: true,
    sharedFrom,
    options: {
      cwd,
      src: values.get('src') ?? 'src',
      entry: values.get('entry') ?? 'index.ts',
      outFile,
      name,
      // `--shared-from` 이면 `run` 이 매니페스트를 읽어 덮는다. 기본값은 플러그인과 같은
      // 목록이다 — CLI 가 자기만의 기본 목록을 따로 들면 둘이 갈린다.
      shared: shared.length > 0 ? shared : DEFAULT_SHARED_MODULES,
      babelConfig: values.get('babelConfig'),
      blockScoping,
    },
  }
}
