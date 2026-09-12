/**
 * `paper.config.json` — 소비처가 갖는 전부.
 *
 * 설정을 파일 하나로 모으는 이유: 이 툴의 앞선 형태는 값이 세 군데(환경변수 · 하드코딩된
 * 파일 목록 · 파일명별 예외 맵)에 흩어져 있었고, 그래서 무엇이 적용됐는지 읽어서 알 수 없었다.
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
  /** 마크다운이 있는 디렉터리. 이미지 상대경로도 여기 기준으로 풀린다. */
  readonly docsDir: string
  readonly outDir: string
  /** `coldsurf` 또는 테마 CSS 파일 경로. 소비처 테마는 이 자리로 들어온다. */
  readonly theme: string
  /** Chromium 실행 파일. 이 패키지는 브라우저를 내려받지 않는다. */
  readonly chromePath: string
  readonly page: PageConfig
  /** `paper build` 가 인자 없이 도는 대상. */
  readonly files: readonly string[]
  /** 문서 하나만 다른 지면을 쓸 때. 파일명 → 그 문서의 지면. */
  readonly overrides: Readonly<Record<string, PageConfig>>
}

const DEFAULT_PAGE: PageConfig = { format: 'A4', marginY: 14, marginX: 12 }

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

function readString(raw: unknown, where: string): string {
  if (typeof raw !== 'string' || raw.trim() === '') fail(`${where} 가 필요하다.`)
  return raw
}

/** 설정 파일을 읽어 경로를 전부 절대경로로 편다. 이후 코드는 상대경로를 모른다. */
export function loadConfig(configPath: string): PaperConfig {
  const abs = resolve(configPath)
  const root = dirname(abs)

  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(abs, 'utf8'))
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
      fail(`설정 파일이 없다: ${abs}`)
    }
    fail(`설정 파일을 읽을 수 없다: ${abs}\n${(cause as Error).message}`)
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

  const theme = readString(input.theme, 'theme')

  return {
    docsDir: fromRoot(readString(input.docsDir, 'docsDir')),
    outDir: fromRoot(readString(input.outDir, 'outDir')),
    // `coldsurf` 는 이 패키지가 굽는 테마 이름이고, 그 외는 소비처 CSS 파일 경로다.
    theme: theme === 'coldsurf' ? theme : fromRoot(theme),
    chromePath: readString(input.chromePath, 'chromePath'),
    page,
    files: files as readonly string[],
    overrides,
  }
}

/** 문서 하나에 적용되는 지면. override 가 있으면 그쪽이 이긴다. */
export function pageFor(config: PaperConfig, file: string): PageConfig {
  return config.overrides[file] ?? config.page
}
