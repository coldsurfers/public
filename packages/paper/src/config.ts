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
