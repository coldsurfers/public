/**
 * bin — 미니앱 번들을 굽는다. `../esbuild` 를 감싸는 얇은 껍데기다.
 *
 * ⏸ **Phase 1** — 실행 가능한 명령은 아직 없다.
 */

const USAGE = `react-native-mf <command>

  build   미니앱 엔트리를 원격 번들로 굽는다   (Phase 1)
`

export function run(argv: string[]): number {
  const [command] = argv

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(USAGE)
    return command ? 0 : 1
  }

  process.stderr.write(`[react-native-mf] "${command}" 는 아직 구현되지 않았다 (Phase 1).\n`)
  return 1
}

process.exitCode = run(process.argv.slice(2))
