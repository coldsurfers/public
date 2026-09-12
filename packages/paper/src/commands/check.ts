import { checkDocument } from '../check/run.js'
import { announceChrome, parse } from './shared.js'

export async function check(args: readonly string[]): Promise<number> {
  const invocation = parse(args)
  announceChrome(invocation.chrome)

  let total = 0

  for (const document of invocation.documents) {
    const result = await checkDocument({
      document,
      theme: invocation.config.theme,
      chromePath: invocation.chrome.path,
    })

    if (result.findings.length === 0) {
      console.log(`${document.key}  ok · ${result.pageCount}장`)
      continue
    }
    total += result.findings.length
    console.log(`${document.key}  ${result.pageCount}장`)
    for (const finding of result.findings) {
      console.log(`  ${finding.kind}: ${finding.detail}`)
    }
  }

  return total === 0 ? 0 : 1
}
