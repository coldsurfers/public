import { watch as watchFs } from 'node:fs'
import { relative } from 'node:path'
import { buildOne } from './build.js'
import { announceChrome, type Document, parse } from './shared.js'

/**
 * 저장하면 다시 굽는다.
 *
 * 에디터는 저장 한 번에 이벤트를 여러 번 낸다(rename + change). 굽는 데 몇 초가 걸려서
 * 그대로 받으면 Chromium 이 겹쳐 뜬다 — 문서마다 하나만 돌게 잠근다.
 */
export async function watch(args: readonly string[]): Promise<number> {
  const invocation = parse(args)
  announceChrome(invocation.chrome)

  const running = new Set<string>()
  const pending = new Set<string>()

  async function rebuild(document: Document): Promise<void> {
    if (running.has(document.key)) {
      pending.add(document.key)
      return
    }
    running.add(document.key)
    try {
      await buildOne(invocation, document)
      // 로컬 시각 — 감시 로그는 사람이 자기 시계와 대조하며 읽는다.
      const at = new Date().toTimeString().slice(0, 8)
      console.log(`${at}  ${document.key} → ${relative(process.cwd(), document.outPath)}`)
    } catch (cause) {
      console.error(`${document.key}: ${(cause as Error).message}`)
    } finally {
      running.delete(document.key)
      if (pending.delete(document.key)) await rebuild(document)
    }
  }

  for (const document of invocation.documents) {
    watchFs(document.srcPath, () => {
      void rebuild(document)
    })
    console.log(`watching ${document.key}`)
  }

  // 감시자가 이벤트 루프를 잡고 있어서 여기서 끝나지 않는다.
  return new Promise<number>(() => {})
}
