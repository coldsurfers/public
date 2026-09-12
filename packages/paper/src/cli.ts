/**
 * `paper` 진입점.
 *
 * 커맨드는 레지스트리 하나로 모은다 — usage 를 이 표에서 만들어야 **구현되지 않은 커맨드가
 * 도움말에 실리는 일이 없다.** 표에 있으면 돌고, 없으면 도움말에도 없다.
 */
import { build } from './commands/build.js'
import { check } from './commands/check.js'
import { watch } from './commands/watch.js'

type Command = {
  readonly summary: string
  readonly run: (args: readonly string[]) => Promise<number>
}

const COMMANDS: Readonly<Record<string, Command>> = {
  build: { summary: '문서를 PDF 로 굽는다', run: build },
  watch: { summary: '저장하면 다시 굽는다', run: watch },
  check: { summary: '깨진 이미지 · 지면을 넘는 그림을 찾는다', run: check },
}

function usage(): string {
  const names = Object.keys(COMMANDS)
  const width = Math.max(...names.map((name) => name.length)) + 2
  return [
    'paper — 마크다운을 지면으로 굽는다.',
    '',
    '커맨드:',
    ...names.map((name) => `  paper ${name.padEnd(width)}${COMMANDS[name]?.summary ?? ''}`),
    '',
    '설정은 paper.config.json 에서 읽는다. --config <경로> 로 바꾼다.',
    '문서를 인자로 넘기면 설정의 files 대신 그것만 다룬다.',
  ].join('\n')
}

async function main(argv: readonly string[]): Promise<number> {
  const [name, ...rest] = argv

  if (name === undefined || name === '--help' || name === '-h') {
    console.log(usage())
    return name === undefined ? 1 : 0
  }

  const command = COMMANDS[name]
  if (command === undefined) {
    console.error(`알 수 없는 커맨드: ${name}\n`)
    console.error(usage())
    return 1
  }

  try {
    return await command.run(rest)
  } catch (cause) {
    console.error((cause as Error).message)
    return 1
  }
}

process.exitCode = await main(process.argv.slice(2))
