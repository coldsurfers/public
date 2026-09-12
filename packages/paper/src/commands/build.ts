import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { renderHtml } from '../render/html.js'
import { printPdf } from '../render/pdf.js'
import { announceChrome, type Document, type Invocation, parse } from './shared.js'

/** 문서 하나를 굽는다. watch 가 같은 함수를 다시 부른다. */
export async function buildOne(invocation: Invocation, document: Document): Promise<string> {
  const html = renderHtml({
    markdown: readFileSync(document.srcPath, 'utf8'),
    theme: invocation.config.theme,
    page: document.page,
  })

  await printPdf(
    { html, docDir: document.docDir, chromePath: invocation.chrome.path },
    document.outPath,
  )
  return document.outPath
}

export async function build(args: readonly string[]): Promise<number> {
  const invocation = parse(args)
  announceChrome(invocation.chrome)

  for (const document of invocation.documents) {
    await buildOne(invocation, document)
    console.log(
      `${document.key} → ${relative(process.cwd(), document.outPath)} (${document.page.format})`,
    )
  }

  return 0
}
