/**
 * Chromium 실행 파일을 찾는다.
 *
 * 이 패키지는 브라우저를 내려받지 않는다. 대신 **이미 깔려 있는 것을 찾는다** — 경로를
 * 사람이 적게 하면 그 값은 기계마다 다른데 설정 파일은 커밋되고, 그러면 macOS 에서 적은
 * 값을 Windows 사람이 받아 그대로 깨진다.
 *
 * 우선순위: 환경변수 → 설정 → 알려진 경로.
 * 환경변수가 설정보다 앞인 이유는 **커밋되지 않는 값이기 때문**이다. 팀이 공유하는 설정을
 * 개인 기계가 덮을 수 있어야 한다.
 */
import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

export const CHROME_PATH_ENV = 'PAPER_CHROME_PATH'

/** 플랫폼별 표준 설치 경로. 위에서부터 먼저 찾는다 — Chrome 이 없으면 Chromium 도 된다. */
function knownPaths(): readonly string[] {
  const home = homedir()

  switch (platform()) {
    case 'darwin':
      return [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
      ]
    case 'win32': {
      // 레지스트리를 읽지 않는다. 표준 설치 위치 셋이면 사실상 다 걸리고, 안 걸리면
      // 환경변수나 설정으로 받는 길이 이미 있다.
      const programFiles = process.env.PROGRAMFILES ?? 'C:\\Program Files'
      const programFilesX86 = process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)'
      const localAppData = process.env.LOCALAPPDATA ?? join(home, 'AppData', 'Local')
      const chrome = join('Google', 'Chrome', 'Application', 'chrome.exe')
      return [
        join(programFiles, chrome),
        join(programFilesX86, chrome),
        join(localAppData, chrome),
        join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      ]
    }
    default:
      return [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
      ]
  }
}

export type ChromeSource = 'config' | 'env' | 'found'

export type Chrome = {
  readonly path: string
  readonly source: ChromeSource
}

export class ChromeNotFoundError extends Error {
  constructor() {
    super(
      [
        'Chromium 을 찾지 못했다.',
        '',
        '찾아본 곳:',
        ...knownPaths().map((path) => `  ${path}`),
        '',
        `설치돼 있다면 ${CHROME_PATH_ENV} 환경변수나 설정의 chromePath 로 경로를 알려준다.`,
      ].join('\n'),
    )
  }
}

/** 환경변수 → 설정 → 깔려 있는 것. */
export function resolveChrome(configured?: string): Chrome {
  const fromEnv = process.env[CHROME_PATH_ENV]
  if (fromEnv !== undefined && fromEnv !== '') return { path: fromEnv, source: 'env' }

  if (configured !== undefined && configured !== '') return { path: configured, source: 'config' }

  const found = knownPaths().find((path) => existsSync(path))
  if (found === undefined) throw new ChromeNotFoundError()

  return { path: found, source: 'found' }
}
