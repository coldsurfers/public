/** 커맨드가 공유하는 인자 해석 — `--config` 한 개와 나머지 파일 목록. */
import { loadConfig, type PaperConfig } from '../config.js'

export type Invocation = {
  readonly config: PaperConfig
  /** 인자로 받은 문서. 비었으면 설정의 `files` 를 쓴다. */
  readonly files: readonly string[]
}

export function parse(args: readonly string[]): Invocation {
  const rest: string[] = []
  let configPath = 'paper.config.json'

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--config' || arg === '-c') {
      const value = args[i + 1]
      if (value === undefined) throw new Error('--config 뒤에 경로가 필요하다.')
      configPath = value
      i += 1
      continue
    }
    if (arg !== undefined) rest.push(arg)
  }

  const config = loadConfig(configPath)
  const files = rest.length > 0 ? rest : config.files

  if (files.length === 0) {
    throw new Error('구울 문서가 없다. 인자로 넘기거나 설정의 files 에 적는다.')
  }

  return { config, files }
}
