/**
 * 산출물 검증 — PDF 를 사람이 열어보기 전에 잡을 수 있는 것들.
 *
 * 둘을 본다. 하나는 렌더 전에(없는 이미지), 하나는 렌더 후에(빈 장). 빈 장은 인쇄 엔진이
 * 만든 결과라 결과물을 봐야 하고, 없는 이미지는 문서만 읽으면 알 수 있어 브라우저를 띄우기
 * 전에 잡는다.
 */
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import type { Document } from '../commands/shared.js'
import { imageSources, renderHtml } from '../render/html.js'
import { pdfBuffer } from '../render/pdf.js'
import { blankPages } from './blank-pages.js'

export type Finding = {
  readonly kind: 'missing-image' | 'blank-page'
  readonly detail: string
}

export type CheckResult = {
  readonly file: string
  readonly pageCount: number
  readonly findings: readonly Finding[]
}

/** 문서가 가리키는데 없는 이미지. 렌더하면 깨진 아이콘이 되어 지면에 그대로 실린다. */
function missingImages(markdown: string, docDir: string): readonly Finding[] {
  return imageSources(markdown)
    .filter((src) => !/^(https?:|data:)/.test(src))
    .filter((src) => !existsSync(isAbsolute(src) ? src : join(docDir, src)))
    .map((src) => ({ kind: 'missing-image' as const, detail: src }))
}

export async function checkDocument(input: {
  readonly document: Document
  readonly theme: string
  readonly chromePath: string
}): Promise<CheckResult> {
  const { document } = input
  const markdown = readFileSync(document.srcPath, 'utf8')
  const findings: Finding[] = [...missingImages(markdown, document.docDir)]

  const pdf = await pdfBuffer({
    html: renderHtml({ markdown, theme: input.theme, page: document.page }),
    docDir: document.docDir,
    chromePath: input.chromePath,
  })

  const blank = blankPages(pdf)
  const pageCount = (
    Buffer.from(pdf)
      .toString('latin1')
      .match(/\/Type\s*\/Page[^s]/g) ?? []
  ).length

  for (const pageNumber of blank) {
    findings.push({ kind: 'blank-page', detail: `${pageNumber}장 — 읽을 게 없다` })
  }

  return { file: document.key, pageCount, findings }
}
