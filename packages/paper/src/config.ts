/**
 * `paper.config.json` — **없어도 된다.**
 *
 * 설정은 "매번 같은 문서 묶음을 굽는" 소비처의 편의 수단이다. 문서 한 장 구우려고 필수
 * 필드 넷을 먼저 적게 하면, 처음 쓰는 사람은 설정부터 써야 한다.
 *
 * 그래서 필드는 전부 선택이고, 설정 파일 자체도 선택이다. 다만 `--config` 로 **명시한**
 * 경로가 없으면 그건 실패다 — 사람이 가리킨 파일이 없는 것과, 아예 안 쓰는 것은 다르다.
 *
 * 스키마 라이브러리를 들이지 않는다 — 필드가 여덟이고, 진단 메시지는 직접 쓰는 쪽이 낫다.
 */
import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'

/** 지면 크기 — [가로, 세로] mm. Chromium `@page size` 에 그대로 넘어간다. */
export const PAGE_SIZES = {
  A3: [297, 420],
  A4: [210, 297],
  A5: [148, 210],
  Letter: [216, 279],
} as const

export type PageFormat = keyof typeof PAGE_SIZES

export type PageConfig = {
  readonly format: PageFormat
  /** 지면 위아래 여백. mm 단위 숫자다 — `@page margin` 과 지면 기하 계산이 함께 읽는다. */
  readonly marginY: number
  /** 좌우 여백. */
  readonly marginX: number
}

export type PaperConfig = {
  /** 설정의 `files` 가 풀리는 기준. 없으면 실행 위치다. */
  readonly docsDir: string
  /** 없으면 문서가 있는 자리의 `pdf/` 다. */
  readonly outDir: string | undefined
  /** `coldsurf` 또는 테마 CSS 파일 경로. */
  readonly theme: string
  /** 없으면 환경변수와 표준 설치 경로에서 찾는다. */
  readonly chromePath: string | undefined
  readonly page: PageConfig
  /** `paper build` 가 인자 없이 도는 대상. */
  readonly files: readonly string[]
  /** 문서 하나만 다른 지면을 쓸 때. 파일명 → 그 문서의 지면. */
  readonly overrides: Readonly<Record<string, PageConfig>>
}

export const DEFAULT_PAGE: PageConfig = { format: 'A4', marginY: 14, marginX: 12 }

export const DEFAULT_CONFIG: PaperConfig = {
  docsDir: process.cwd(),
  outDir: undefined,
  theme: 'coldsurf',
  chromePath: undefined,
  page: DEFAULT_PAGE,
  files: [],
  overrides: {},
}

/**
 * `paper.config.json` 의 JSON Schema. `paper init` 이 첫 줄에 박는 `$schema` 가 이걸 가리키고,
 * 에디터는 그때부터 필드 이름과 `format` 의 값을 스스로 안다.
 *
 * **열거와 기본값은 위의 상수에서 파생한다.** 스키마를 손으로 들고 있으면 `PAGE_SIZES` 에
 * 지면을 하나 더해도 스키마는 그대로 남는다 — `paper` 를 만든 이유가 그 구조였다.
 *
 * 필드 이름은 `satisfies` 가 묶는다. `PaperConfig` 에 필드를 더하고 여기를 안 고치면
 * `check:type` 이 깨진다 — `build.mjs` 가 `PRINT_VAR_NAMES` 로 하는 일과 같은 자리다.
 *
 * 설명 문장은 여기가 정본이다. 위의 JSDoc 은 이 파일을 고치는 사람이 읽고, 이쪽은 설정을
 * 쓰는 소비처가 에디터 툴팁으로 읽는다.
 */
type SchemaNode = { readonly [key: string]: unknown }

type ObjectSchemaFor<T> = SchemaNode & {
  readonly type: 'object'
  readonly properties: SchemaNode & { readonly [K in keyof T]-?: SchemaNode }
}

const PAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    format: {
      type: 'string',
      enum: Object.keys(PAGE_SIZES),
      default: DEFAULT_PAGE.format,
      description: '지면 크기.',
    },
    marginY: {
      type: 'number',
      minimum: 0,
      default: DEFAULT_PAGE.marginY,
      description: '지면 위아래 여백. mm 단위.',
    },
    marginX: {
      type: 'number',
      minimum: 0,
      default: DEFAULT_PAGE.marginX,
      description: '좌우 여백. mm 단위.',
    },
  },
} as const satisfies ObjectSchemaFor<PageConfig>

export const CONFIG_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'paper.config.json',
  description: 'COLDSURF paper — 마크다운을 지면으로 굽는 CLI 의 설정. 필드는 전부 선택이다.',
  type: 'object',
  additionalProperties: false,
  properties: {
    $schema: { type: 'string', description: '이 스키마의 위치. paper init 이 써 둔다.' },
    docsDir: {
      type: 'string',
      description: 'files 가 풀리는 기준 디렉터리. 없으면 이 설정 파일이 있는 자리다.',
    },
    outDir: {
      type: 'string',
      description: 'PDF 가 떨어지는 자리. 없으면 문서 옆 pdf/ 다.',
    },
    theme: {
      // `coldsurf` 하나만 발행하고 나머지는 소비처 CSS 경로다 — 열거로 닫으면 그 경로가 막힌다.
      // 후보는 보여주되 값은 열어 두는 모양이 anyOf 다.
      anyOf: [{ const: 'coldsurf' }, { type: 'string' }],
      default: DEFAULT_CONFIG.theme,
      description: "'coldsurf' 이거나 테마 CSS 파일 경로.",
    },
    chromePath: {
      type: 'string',
      description:
        'Chromium 실행 경로. 없으면 표준 설치 경로에서 찾는다. PAPER_CHROME_PATH 가 이 값을 이긴다.',
    },
    page: { ...PAGE_SCHEMA, description: '기본 지면.' },
    files: {
      type: 'array',
      items: { type: 'string' },
      description: 'paper build 가 인자 없이 굽는 대상. docsDir 기준 경로다.',
    },
    overrides: {
      type: 'object',
      additionalProperties: PAGE_SCHEMA,
      description: '문서 하나만 다른 지면을 쓸 때. 파일명 → 그 문서의 지면.',
    },
  },
} as const satisfies ObjectSchemaFor<PaperConfig>

class ConfigError extends Error {}

function fail(message: string): never {
  throw new ConfigError(message)
}

function readPage(raw: unknown, where: string, base: PageConfig): PageConfig {
  if (raw === undefined) return base
  if (typeof raw !== 'object' || raw === null) fail(`${where} 는 객체여야 한다.`)

  const { format, marginY, marginX } = raw as Record<string, unknown>

  if (format !== undefined && !(typeof format === 'string' && format in PAGE_SIZES)) {
    fail(
      `${where}.format 은 ${Object.keys(PAGE_SIZES).join(' · ')} 중 하나여야 한다: ${String(format)}`,
    )
  }
  for (const [key, value] of [
    ['marginY', marginY],
    ['marginX', marginX],
  ] as const) {
    if (
      value !== undefined &&
      (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    ) {
      fail(`${where}.${key} 는 mm 단위 숫자여야 한다: ${String(value)}`)
    }
  }

  return {
    format: (format as PageFormat | undefined) ?? base.format,
    marginY: (marginY as number | undefined) ?? base.marginY,
    marginX: (marginX as number | undefined) ?? base.marginX,
  }
}

function readOptionalString(raw: unknown, where: string): string | undefined {
  if (raw === undefined) return undefined
  if (typeof raw !== 'string' || raw.trim() === '')
    fail(`${where} 는 비어 있지 않은 문자열이어야 한다.`)
  return raw
}

/**
 * 설정을 읽는다. `explicit` 이면 파일이 없을 때 실패하고, 아니면 기본값으로 돈다.
 * 경로는 전부 절대경로로 편다 — 이후 코드는 상대경로를 모른다.
 */
export function loadConfig(configPath: string, explicit: boolean): PaperConfig {
  const abs = resolve(configPath)
  const root = dirname(abs)

  let source: string
  try {
    source = readFileSync(abs, 'utf8')
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
      if (explicit) fail(`설정 파일이 없다: ${abs}`)
      return DEFAULT_CONFIG
    }
    fail(`설정 파일을 읽을 수 없다: ${abs}\n${(cause as Error).message}`)
  }

  let raw: unknown
  try {
    raw = JSON.parse(source)
  } catch (cause) {
    fail(`설정 파일이 올바른 JSON 이 아니다: ${abs}\n${(cause as Error).message}`)
  }
  if (typeof raw !== 'object' || raw === null) fail(`설정은 객체여야 한다: ${abs}`)

  const input = raw as Record<string, unknown>
  const fromRoot = (value: string): string => (isAbsolute(value) ? value : resolve(root, value))

  const page = readPage(input.page, 'page', DEFAULT_PAGE)

  const files = input.files ?? []
  if (!Array.isArray(files) || files.some((f) => typeof f !== 'string')) {
    fail('files 는 문자열 배열이어야 한다.')
  }

  const overridesRaw = input.overrides ?? {}
  if (typeof overridesRaw !== 'object' || overridesRaw === null) {
    fail('overrides 는 객체여야 한다.')
  }
  const overrides = Object.fromEntries(
    Object.entries(overridesRaw as Record<string, unknown>).map(([file, value]) => [
      file,
      readPage(value, `overrides["${file}"]`, page),
    ]),
  )

  const docsDir = readOptionalString(input.docsDir, 'docsDir')
  const outDir = readOptionalString(input.outDir, 'outDir')
  const theme = readOptionalString(input.theme, 'theme')

  return {
    docsDir: docsDir === undefined ? root : fromRoot(docsDir),
    outDir: outDir === undefined ? undefined : fromRoot(outDir),
    // `coldsurf` 는 이 패키지가 굽는 테마 이름이고, 그 외는 소비처 CSS 파일 경로다.
    theme: theme === undefined || theme === 'coldsurf' ? 'coldsurf' : fromRoot(theme),
    chromePath: readOptionalString(input.chromePath, 'chromePath'),
    page,
    files: files as readonly string[],
    overrides,
  }
}

/** 문서 하나에 적용되는 지면. override 가 있으면 그쪽이 이긴다. */
export function pageFor(config: PaperConfig, file: string): PageConfig {
  return config.overrides[file] ?? config.page
}
