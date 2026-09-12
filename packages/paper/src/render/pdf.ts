/**
 * HTML → PDF. Chromium 은 소비처의 것을 쓴다.
 *
 * **브라우저를 내려받지 않는다.** `puppeteer-core` 는 Chromium 을 끌고 오지 않는 쪽이고,
 * 실행 경로는 `chrome.ts` 가 찾아서 준다 — 발행 패키지가 250MB 를 강제하지 않는 자리다.
 *
 * HTML 을 문서 디렉터리 안에 잠깐 쓰고 `file://` 로 연다. `setContent` 로 넣으면 문서가
 * `about:blank` 가 되어 상대경로 이미지가 하나도 안 실린다.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'

export type PrintInput = {
  readonly html: string
  /** 상대경로 이미지의 기준. 임시 HTML 도 여기 쓴다. */
  readonly docDir: string
  readonly chromePath: string
}

async function launch(chromePath: string): Promise<Browser> {
  try {
    return await puppeteer.launch({ executablePath: chromePath, headless: true })
  } catch (cause) {
    throw new Error(`Chromium 을 띄우지 못했다: ${chromePath}\n${(cause as Error).message}`)
  }
}

/**
 * 임시 HTML 을 열고 콜백에 페이지를 넘긴다. 굽기와 재기가 같은 길을 쓰게 해서,
 * `check` 가 재는 지면과 `build` 가 굽는 지면이 어긋날 수 없다.
 */
async function withPage<T>(input: PrintInput, use: (page: Page) => Promise<T>): Promise<T> {
  const htmlPath = join(input.docDir, `.paper-${process.pid}.html`)
  writeFileSync(htmlPath, input.html, 'utf8')

  const browser = await launch(input.chromePath)
  try {
    const page = await browser.newPage()
    // 웹폰트가 도착하기 전에 구우면 폴백 폰트로 조판된 지면이 나온다 — 자간까지 달라진다.
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)
    return await use(page)
  } finally {
    await browser.close()
    rmSync(htmlPath, { force: true })
  }
}

export async function printPdf(input: PrintInput, destPath: string): Promise<void> {
  mkdirSync(join(destPath, '..'), { recursive: true })
  writeFileSync(destPath, await pdfBuffer(input))
}

/** 파일로 떨구지 않고 바이트만 — `check` 가 굽지 않고 들여다볼 때 쓴다. */
export async function pdfBuffer(input: PrintInput): Promise<Uint8Array> {
  return withPage(input, (page) =>
    page.pdf({
      // 지면 크기·여백은 전부 CSS `@page` 에서 온다. 여기서 또 정하면 두 벌이 된다.
      preferCSSPageSize: true,
      printBackground: true,
    }),
  )
}
