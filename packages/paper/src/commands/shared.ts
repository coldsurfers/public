/**
 * 커맨드가 공유하는 것 — 인자 해석, 문서 확정, Chromium 확정.
 *
 * **인자는 실행 위치 기준, 설정의 `files` 는 `docsDir` 기준이다.** 두 입력의 기준이 다른 게
 * 아니라, 각자 당연한 기준을 쓴다 — 셸에서 탭 완성으로 얻는 경로는 실행 위치 기준이고,
 * 설정에 적는 목록은 그 설정이 가리키는 디렉터리 기준이다.
 */
import { existsSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { type Chrome, resolveChrome } from '../chrome.js'
import { loadConfig, type PageConfig, type PaperConfig, pageFor } from '../config.js'

export type Document = {
  /** 설정의 `overrides` 를 찾을 때 쓰는 이름. 사용자가 적은 그대로다. */
  readonly key: string
  readonly srcPath: string
  /** 상대경로 이미지의 기준. */
  readonly docDir: string
  readonly outPath: string
  readonly page: PageConfig
}

export type Invocation = {
  readonly config: PaperConfig
  readonly chrome: Chrome
  readonly documents: readonly Document[]
}

function toDocument(config: PaperConfig, key: string, srcPath: string): Document {
  // 굽기 직전이 아니라 여기서 잡는다 — 문서 다섯 중 셋째가 없으면, 앞의 둘을 굽고 나서
  // 터지는 대신 시작하기 전에 알려주는 쪽이 낫다.
  if (!existsSync(srcPath)) {
    throw new Error(`문서가 없다: ${srcPath}\n인자로 준 경로는 실행 위치 기준으로 푼다.`)
  }

  const docDir = dirname(srcPath)
  const outDir = config.outDir ?? join(docDir, 'pdf')
  return {
    key,
    srcPath,
    docDir,
    outPath: join(outDir, `${basename(srcPath, '.md')}.pdf`),
    // 인자로 준 경로에도 override 가 걸리도록 파일명으로도 찾아본다.
    page: config.overrides[key] ?? pageFor(config, basename(srcPath)),
  }
}

export function parse(args: readonly string[]): Invocation {
  const rest: string[] = []
  let configPath = 'paper.config.json'
  let explicitConfig = false

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--config' || arg === '-c') {
      const value = args[i + 1]
      if (value === undefined) throw new Error('--config 뒤에 경로가 필요하다.')
      configPath = value
      explicitConfig = true
      i += 1
      continue
    }
    if (arg !== undefined) rest.push(arg)
  }

  const config = loadConfig(configPath, explicitConfig)

  const documents =
    rest.length > 0
      ? rest.map((arg) => toDocument(config, arg, resolve(arg)))
      : config.files.map((file) => toDocument(config, file, resolve(config.docsDir, file)))

  if (documents.length === 0) {
    throw new Error(
      '구울 문서가 없다. 파일을 인자로 넘기거나, paper.config.json 의 files 에 적는다.',
    )
  }

  return { config, chrome: resolveChrome(config.chromePath), documents }
}

/** 자동으로 찾은 Chromium 은 한 번 알려준다 — 어느 브라우저로 구웠는지 남아야 한다. */
export function announceChrome(chrome: Chrome): void {
  if (chrome.source === 'found') console.log(`chrome: ${chrome.path}`)
}
