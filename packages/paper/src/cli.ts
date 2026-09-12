/**
 * `paper` 진입점.
 *
 * 커맨드는 레지스트리 하나로 모은다 — usage 를 이 표에서 만들어야 **구현되지 않은 커맨드가
 * 도움말에 실리는 일이 없다.** 표에 있으면 돌고, 없으면 도움말에도 없다.
 */

type Command = {
  readonly summary: string
  readonly run: (args: readonly string[]) => Promise<number>
}

const COMMANDS: Readonly<Record<string, Command>> = {}

function usage(): string {
  const names = Object.keys(COMMANDS)
  const lines = names.map(
    (name) =>
      `  paper ${name}${' '.repeat(Math.max(1, 10 - name.length))}${COMMANDS[name]?.summary ?? ''}`,
  )
  return [
    'paper — 마크다운을 지면으로 굽는다.',
    '',
    names.length > 0
      ? '커맨드:'
      : '아직 커맨드가 없다. 진행 상황: https://github.com/coldsurfers/public/issues/124',
    ...lines,
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

  return command.run(rest)
}

process.exitCode = await main(process.argv.slice(2))
