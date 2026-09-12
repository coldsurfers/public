import { watch as watchFs } from 'node:fs'
import { relative, resolve } from 'node:path'
import { buildOne } from './build.js'
import { parse } from './shared.js'

/**
 * 저장하면 다시 굽는다.
 *
 * 에디터는 저장 한 번에 이벤트를 여러 번 낸다(rename + change). 굽는 데 몇 초가 걸려서
 * 그대로 받으면 Chromium 이 겹쳐 뜬다 — 파일마다 하나만 돌게 잠근다.
 */
export async function watch(args: readonly string[]): Promise<number> {
  const invocation = parse(args)
  const running = new Set<string>()
  const pending = new Set<string>()

  async function rebuild(file: string): Promise<void> {
    if (running.has(file)) {
      pending.add(file)
      return
    }
    running.add(file)
    try {
      const destPath = await buildOne(invocation, file)
      console.log(
        `${new Date().toISOString().slice(11, 19)}  ${file} → ${relative(process.cwd(), destPath)}`,
      )
    } catch (cause) {
      console.error(`${file}: ${(cause as Error).message}`)
    } finally {
      running.delete(file)
      if (pending.delete(file)) await rebuild(file)
    }
  }

  for (const file of invocation.files) {
    const srcPath = resolve(invocation.config.docsDir, file)
    watchFs(srcPath, () => {
      void rebuild(file)
    })
    console.log(`watching ${file}`)
  }

  // 감시자가 이벤트 루프를 잡고 있어서 여기서 끝나지 않는다.
  return new Promise<number>(() => {})
}
