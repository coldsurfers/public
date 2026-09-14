/**
 * `paper init` — 설정 파일을 **얻는** 경로.
 *
 * 지금까지 소비처가 `paper.config.json` 을 갖는 방법은 README 예제 복붙 하나였다. 편집 단계에
 * 자동완성을 켜는 건 `"$schema"` 한 줄인데, 그 한 줄이 **자동완성 없이 먼저 정확히 쳐야 하는
 * 값**이다. 그래서 스키마와 이 커맨드는 따로 낼 게 아니라 하나다.
 *
 * **설정을 권하지 않는다.** 설정 없이 `paper build a.md` 가 도는 건 의도다(`config.ts`).
 * 이 커맨드는 도움말에 있되, README 는 설정 없는 경로를 계속 1급으로 말한다.
 */
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { DEFAULT_CONFIG, DEFAULT_PAGE } from '../config.js'
import { splitConfigArg } from './shared.js'

const SCHEMA_IN_PACKAGE = join('node_modules', '@coldsurfers', 'paper', 'dist', 'schema.json')

/**
 * 설정을 쓰는 자리에서 위로 올라가며 **실제로 설치된** 스키마를 찾는다.
 *
 * 고정 URL 로 박지 않는 이유가 둘이다. `dist` 는 커밋되지 않아 저장소에 그 파일이 없고,
 * 이 패키지는 GitHub Packages 로 발행돼 CDN 에도 없다 — 박을 URL 자체가 없다. 상대경로는
 * 설치된 버전과 정합까지 맞는 대신, 사람이 설정 파일을 옮기면 끊긴다.
 */
function findSchema(from: string): string | undefined {
  let dir = from
  for (;;) {
    const candidate = join(dir, SCHEMA_IN_PACKAGE)
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/** JSON 안의 참조는 OS 와 무관하게 `/` 다. Windows 의 `\` 를 그대로 쓰면 에디터가 못 연다. */
function toRef(configDir: string, schemaPath: string): string {
  const rel = relative(configDir, schemaPath).split(sep).join('/')
  return rel.startsWith('.') ? rel : `./${rel}`
}

export async function init(args: readonly string[]): Promise<number> {
  const { configPath, rest } = splitConfigArg(args)
  if (rest.length > 0) {
    throw new Error(`paper init 은 인자를 받지 않는다: ${rest.join(' ')}\n위치는 --config 로 준다.`)
  }

  const abs = resolve(configPath)
  // 덮어쓰지 않는다. 이미 손댄 설정을 기본값으로 되돌리는 건 init 의 일이 아니다.
  if (existsSync(abs)) {
    throw new Error(`이미 있다: ${abs}`)
  }

  const configDir = dirname(abs)
  const schemaPath = findSchema(configDir)

  const config = {
    ...(schemaPath === undefined ? {} : { $schema: toRef(configDir, schemaPath) }),
    // `DEFAULT_CONFIG.docsDir` 은 실행 위치지만, 설정 안의 경로는 설정 파일 기준으로 풀린다.
    // 같은 자리를 가리키는 표기가 여기선 `.` 다.
    docsDir: '.',
    theme: DEFAULT_CONFIG.theme,
    page: DEFAULT_PAGE,
    // 굽는 대상은 사람이 적는다. 여기서 `.md` 를 훑어 채우면 node_modules 와 빌드 산출물까지
    // 딸려 들어오는데, 그건 init 이 추측할 자리가 아니다.
    files: [],
    overrides: {},
  }
  // `outDir` · `chromePath` 는 안 적는다. 전자는 없으면 문서 옆 `pdf/` 라 적을 이유가 없고,
  // 후자는 기계마다 다른 값이라 커밋되는 파일에 들어가면 안 된다(README 의 환경변수 우선 규칙).

  writeFileSync(abs, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
  console.log(`${relative(process.cwd(), abs)} 를 썼다.`)

  if (schemaPath === undefined) {
    console.log('스키마를 못 찾아 $schema 를 비웠다 — 설치된 패키지 안에서 실행하면 채워진다.')
  }
  return 0
}
