import { checkDocument } from '../check/run.js'
import { pageFor } from '../config.js'
import { parse } from './shared.js'

export async function check(args: readonly string[]): Promise<number> {
  const { config, files } = parse(args)
  let total = 0

  for (const file of files) {
    const result = await checkDocument({
      file,
      docsDir: config.docsDir,
      theme: config.theme,
      page: pageFor(config, file),
      chromePath: config.chromePath,
    })

    if (result.findings.length === 0) {
      console.log(`${file}  ok · ${result.pageCount}장`)
      continue
    }
    total += result.findings.length
    console.log(`${file}  ${result.pageCount}장`)
    for (const finding of result.findings) {
      console.log(`  ${finding.kind}: ${finding.detail}`)
    }
  }

  return total === 0 ? 0 : 1
}
