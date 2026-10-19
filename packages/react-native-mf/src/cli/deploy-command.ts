/**
 * `deploy` · `rollback` · `promote` — 인자 해석과 묻기만 여기 있다. 하는 일은 `../deploy/deploy`.
 *
 * `../deploy/*` 는 부를 때 연다. 거기서 `./build` 를 통해 esbuild · babel 을 문다.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline'

export type DeployArgs = { channel: string; interactive: boolean; config?: string } & (
  | { command: 'deploy' }
  | { command: 'rollback'; to?: string }
  | { command: 'promote'; from: string; version?: string }
)

type Flag = 'channel' | 'config' | 'to' | 'from' | 'version'

const FLAGS = new Map<string, Flag>([
  ['-c', 'channel'],
  ['--channel', 'channel'],
  ['--config', 'config'],
  ['--to', 'to'],
  ['--from', 'from'],
  ['--version', 'version'],
])

/** 명령마다 받는 옵션. 여기 없는 옵션은 다른 명령의 것이다 */
const OWNED: Record<'to' | 'from' | 'version', DeployArgs['command']> = {
  to: 'rollback',
  from: 'promote',
  version: 'promote',
}

export function parseDeployArgs(
  command: DeployArgs['command'],
  argv: readonly string[],
): { ok: true; args: DeployArgs } | { ok: false; error: string } {
  const values: Partial<Record<Flag, string>> = {}
  let interactive = false

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '-i' || token === '--interactive') {
      interactive = true
      continue
    }
    const key = FLAGS.get(token)
    const value = argv[index + 1]
    if (!key) return { ok: false, error: `알 수 없는 옵션 "${token}"` }
    if (value === undefined || value.startsWith('-')) {
      return { ok: false, error: `${token} 에 값이 없다` }
    }
    values[key] = value
    index += 1
  }

  if (!values.channel) return { ok: false, error: '-c, --channel 은 필수다' }
  for (const [flag, owner] of Object.entries(OWNED)) {
    if (values[flag as keyof typeof OWNED] !== undefined && owner !== command) {
      return { ok: false, error: `--${flag} 는 ${owner} 에만 쓴다` }
    }
  }

  const common = { channel: values.channel, interactive, config: values.config }
  if (command === 'deploy') return { ok: true, args: { ...common, command } }
  if (command === 'rollback') return { ok: true, args: { ...common, command, to: values.to } }
  if (!values.from) return { ok: false, error: '--from 은 필수다' }
  return { ok: true, args: { ...common, command, from: values.from, version: values.version } }
}

const BUMPS = ['patch', 'minor', 'major'] as const
type Bump = (typeof BUMPS)[number]

export function bumpVersion(version: string, bump: Bump): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`[react-native-mf] x.y.z 꼴이 아닌 버전은 올리지 못한다: ${version}`)
  const [major, minor, patch] = match.slice(1).map(Number)
  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

type Ask = (question: string) => Promise<string>

/** 고른 버전을 돌려준다. 쓰지는 않는다 — 다음 확인에서 그만두면 파일이 그대로여야 한다 */
async function askVersion(current: string, ask: Ask) {
  const choices = BUMPS.map((bump) => `${bump} → ${bumpVersion(current, bump)}`)
  const answer = (await ask(`버전 ${current} — keep · ${choices.join(' · ')} [patch] `)).trim()
  const choice = answer === '' ? 'patch' : answer
  if (choice === 'keep') return current
  if (!BUMPS.includes(choice as Bump))
    throw new Error(`[react-native-mf] 고를 수 없는 값: ${choice}`)
  return bumpVersion(current, choice as Bump)
}

/** 고친 파일 커밋은 사람이 한다 */
async function writePackageVersion(cwd: string, version: string) {
  const path = resolve(cwd, 'package.json')
  const pkg = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>
  await writeFile(path, `${JSON.stringify({ ...pkg, version }, null, 2)}\n`)
}

async function withPrompt<T>(use: (ask: Ask) => Promise<T>): Promise<T> {
  const prompt = createInterface({ input: process.stdin })
  // `question()` 대신 줄을 하나씩 꺼낸다. 입력이 파이프면 readline 이 줄을 한꺼번에 읽고 닫아서
  // 두 번째 `question()` 이 "readline was closed" 로 끝난다
  const lines = prompt[Symbol.asyncIterator]()
  try {
    return await use(async (question) => {
      process.stdout.write(question)
      const next = await lines.next()
      return next.done ? '' : next.value
    })
  } finally {
    prompt.close()
  }
}

export async function runDeployCommand(args: DeployArgs, cwd: string): Promise<number> {
  const { loadConfig } = await import('../deploy/config')
  const { readPackageVersion, runDeploy, runPromote, runRollback } = await import(
    '../deploy/deploy'
  )
  const config = await loadConfig(cwd, args.config)
  const out = (line: string) => process.stdout.write(`[react-native-mf] ${line}\n`)

  if (args.command === 'rollback') {
    const next = await runRollback({ channel: args.channel, config, to: args.to })
    const live = next.releases.find((release) => release.enabled)
    out(`${config.name} · ${args.channel} → ${live?.version}`)
    return 0
  }

  if (args.command === 'promote') {
    const { from } = args
    const result = await runPromote({
      from,
      channel: args.channel,
      config,
      version: args.version,
      confirm: args.interactive
        ? (release) =>
            withPrompt(async (ask) => {
              const answer = await ask(
                `${config.name}@${release.version} 를 ${from} → ${args.channel} 에 올린다. 계속? [y/N] `,
              )
              return answer.trim().toLowerCase() === 'y'
            })
        : undefined,
    })
    if (result === null) {
      out('그만둔다')
      return 1
    }
    out(`${config.name}@${result.version} → ${args.channel} (${from} 번들 그대로)`)
    out(`manifest ${result.manifestKey}`)
    return 0
  }

  if (args.interactive) {
    const proceed = await withPrompt(async (ask) => {
      const current = await readPackageVersion(cwd)
      const version = await askVersion(current, ask)
      const answer = await ask(`${config.name}@${version} 를 ${args.channel} 에 낸다. 계속? [y/N] `)
      if (answer.trim().toLowerCase() !== 'y') return false
      if (version !== current) await writePackageVersion(cwd, version)
      return true
    })
    if (!proceed) {
      out('그만둔다')
      return 1
    }
  }

  const result = await runDeploy({ cwd, channel: args.channel, config })
  out(`${config.name}@${result.version} → ${args.channel}`)
  out(`bundle   ${result.bundleKey}${result.uploaded ? '' : ' (이미 있음 · 그대로 씀)'}`)
  out(`manifest ${result.manifestKey}`)
  out(`requires ${result.requires.join(', ') || '(없음)'}`)
  return 0
}
