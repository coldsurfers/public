/**
 * `deploy` · `rollback` — 인자 해석과 묻기만 여기 있다. 하는 일은 `../deploy/deploy`.
 *
 * `../deploy/*` 는 부를 때 연다. 거기서 `./build` 를 통해 esbuild · babel 을 문다.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline'

export type DeployArgs = {
  command: 'deploy' | 'rollback'
  channel: string
  interactive: boolean
  config?: string
  to?: string
}

const FLAGS = new Map<string, 'channel' | 'config' | 'to'>([
  ['-c', 'channel'],
  ['--channel', 'channel'],
  ['--config', 'config'],
  ['--to', 'to'],
])

export function parseDeployArgs(
  command: DeployArgs['command'],
  argv: readonly string[],
): { ok: true; args: DeployArgs } | { ok: false; error: string } {
  const values: Partial<Record<'channel' | 'config' | 'to', string>> = {}
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
  if (command === 'deploy' && values.to) return { ok: false, error: '--to 는 rollback 에만 쓴다' }

  return {
    ok: true,
    args: { command, channel: values.channel, interactive, config: values.config, to: values.to },
  }
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

/** 고른 버전을 돌려준다. 쓰지는 않는다 — 다음 확인에서 그만두면 파일이 그대로여야 한다 */
async function askVersion(current: string, ask: (q: string) => Promise<string>) {
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

export async function runDeployCommand(args: DeployArgs, cwd: string): Promise<number> {
  const { loadConfig } = await import('../deploy/config')
  const { readPackageVersion, runDeploy, runRollback } = await import('../deploy/deploy')
  const config = await loadConfig(cwd, args.config)
  const out = (line: string) => process.stdout.write(`[react-native-mf] ${line}\n`)

  if (args.command === 'rollback') {
    const next = await runRollback({ channel: args.channel, config, to: args.to })
    const live = next.releases.find((release) => release.enabled)
    out(`${config.name} · ${args.channel} → ${live?.version}`)
    return 0
  }

  if (args.interactive) {
    const prompt = createInterface({ input: process.stdin })
    // `question()` 대신 줄을 하나씩 꺼낸다. 입력이 파이프면 readline 이 줄을 한꺼번에 읽고 닫아서
    // 두 번째 `question()` 이 "readline was closed" 로 끝난다
    const lines = prompt[Symbol.asyncIterator]()
    const ask = async (question: string) => {
      process.stdout.write(question)
      const next = await lines.next()
      return next.done ? '' : next.value
    }
    try {
      const current = await readPackageVersion(cwd)
      const version = await askVersion(current, ask)
      const answer = await ask(`${config.name}@${version} 를 ${args.channel} 에 낸다. 계속? [y/N] `)
      if (answer.trim().toLowerCase() !== 'y') {
        out('그만둔다')
        return 1
      }
      if (version !== current) await writePackageVersion(cwd, version)
    } finally {
      prompt.close()
    }
  }

  const result = await runDeploy({ cwd, channel: args.channel, config })
  out(`${config.name}@${result.version} → ${args.channel}`)
  out(`bundle   ${result.bundleKey}${result.uploaded ? '' : ' (이미 있음 · 그대로 씀)'}`)
  out(`manifest ${result.manifestKey}`)
  out(`requires ${result.requires.join(', ') || '(없음)'}`)
  return 0
}
