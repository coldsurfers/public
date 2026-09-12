/**
 * 마크다운 → 인쇄용 HTML 한 장.
 *
 * **CSS 를 링크하지 않고 인라인한다.** 파일 URL 로 링크하면 소비처마다 경로 해석이 갈리고,
 * PDF 는 어차피 문서 하나로 닫히는 산출물이라 공유 캐시의 이득이 없다.
 *
 * `marked` 를 쓰는 이유: 문서가 지면 컴포넌트를 **마크다운 안의 원시 HTML** 로 쓴다
 * (`<div class="hero">`). marked 는 그걸 기본으로 통과시키고, GFM 표도 기본이다.
 * remark 조합은 같은 일에 플러그인 다섯을 물어야 한다.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'
import { PAGE_SIZES, type PageConfig } from '../config.js'

const distDir = dirname(fileURLToPath(import.meta.url))
const cssDir = join(distDir, 'css')

const marked = new Marked({ gfm: true, breaks: false })

/**
 * 지면 기하 — 테마가 아니라 **문서**가 갖는 값이다.
 *
 * `@page` 의 `size` 에 커스텀 프로퍼티를 넣을 수 없어서(Chromium), 이 블록만 문서마다 만든다.
 */
function geometry(page: PageConfig): string {
  const [, heightMm] = PAGE_SIZES[page.format]
  const contentHeight = heightMm - page.marginY * 2

  // 이미지는 지면의 3분의 2를 넘지 않는다. 넘기면 break-inside:avoid 와 맞물려 이미지가
  // 통째로 다음 장으로 밀리고 그 앞장이 빈다 — 지면이 커져도 같은 비율로 묶여야 한다.
  const figureMax = Math.round(contentHeight * 0.65)
  // 표지는 한 장을 거의 채운다. 반만 차면 표지로 안 읽힌다.
  const heroMin = contentHeight - 11

  return [
    `@page { size: ${page.format}; margin: ${page.marginY}mm ${page.marginX}mm; }`,
    ':root {',
    `  --print-figure-max-height: ${figureMax}mm;`,
    `  --print-hero-min-height: ${heroMin}mm;`,
    '}',
  ].join('\n')
}

function themeCss(theme: string): string {
  const path = theme === 'coldsurf' ? join(cssDir, 'themes', 'coldsurf.css') : resolve(theme)
  try {
    return readFileSync(path, 'utf8')
  } catch {
    throw new Error(`테마 CSS 를 읽을 수 없다: ${path}`)
  }
}

export type RenderInput = {
  readonly markdown: string
  readonly theme: string
  readonly page: PageConfig
}

export function renderHtml({ markdown, theme, page }: RenderInput): string {
  const styles = [
    themeCss(theme),
    geometry(page),
    readFileSync(join(cssDir, 'print.css'), 'utf8'),
    readFileSync(join(cssDir, 'prose.css'), 'utf8'),
    readFileSync(join(cssDir, 'components.css'), 'utf8'),
  ].join('\n')

  return [
    '<!doctype html>',
    '<html lang="ko">',
    '<head>',
    '<meta charset="utf-8">',
    // 웹폰트는 지면에 굽히기 전에 반드시 도착해야 한다 — 기다리는 책임은 pdf.ts 가 진다.
    '<link rel="preconnect" href="https://cdn.jsdelivr.net">',
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap">',
    `<style>\n${styles}\n</style>`,
    '</head>',
    `<body>\n${marked.parse(markdown, { async: false })}\n</body>`,
    '</html>',
  ].join('\n')
}

/** 문서가 참조하는 이미지 경로. `check` 가 깨진 참조를 찾을 때 쓴다. */
export function imageSources(markdown: string): readonly string[] {
  const html = marked.parse(markdown, { async: false })
  return [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1] ?? '')
}
