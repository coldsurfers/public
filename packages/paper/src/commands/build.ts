import { readFileSync } from 'node:fs'
import { basename, relative, resolve } from 'node:path'
import { pageFor } from '../config.js'
import { renderHtml } from '../render/html.js'
import { printPdf } from '../render/pdf.js'
import { type Invocation, parse } from './shared.js'

/** 문서 하나를 굽는다. watch 가 같은 함수를 다시 부른다. */
export async function buildOne(invocation: Invocation, file: string): Promise<string> {
  const { config } = invocation
  const srcPath = resolve(config.docsDir, file)
  const destPath = resolve(config.outDir, `${basename(file, '.md')}.pdf`)
  const page = pageFor(config, file)

  const html = renderHtml({
    markdown: readFileSync(srcPath, 'utf8'),
    theme: config.theme,
    page,
  })

  await printPdf({ html, docDir: config.docsDir, chromePath: config.chromePath }, destPath)
  return destPath
}

export async function build(args: readonly string[]): Promise<number> {
  const invocation = parse(args)

  for (const file of invocation.files) {
    const page = pageFor(invocation.config, file)
    const destPath = await buildOne(invocation, file)
    console.log(`${file} → ${relative(process.cwd(), destPath)} (${page.format})`)
  }

  return 0
}
