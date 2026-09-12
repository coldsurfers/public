/**
 * PDF 에서 아무것도 안 그려진 장을 찾는다.
 *
 * **왜 렌더된 DOM 이 아니라 PDF 인가:** 화면 레이아웃과 인쇄 페이지네이션은 다른 계산이다.
 * DOM 에서 요소 위치를 재서 지면 높이로 나누면 강제 개행(`break-after: page`)이 든 문서에서
 * 곧장 어긋난다. 빈 장은 인쇄 엔진이 만든 결과라, 그 결과를 봐야 한다.
 *
 * Chromium 이 내는 PDF 는 객체 스트림(`/ObjStm`)을 쓰지 않아 페이지 객체가 평문으로 있다.
 * 각 장의 콘텐츠 스트림을 풀어 **글자를 찍는 연산자(`Tj`·`TJ`)와 이미지 연산자(`Do`)** 가
 * 하나도 없으면 빈 장이다. 배경 면만 칠해진 장도 빈 장으로 센다 — 읽을 게 없으면 빈 장이다.
 */
import { inflateSync } from 'node:zlib'

const PAGE_MARKER = /\/Type\s*\/Page[^s]/g
const CONTENTS_REF = /\/Contents\s+(\d+)\s+0\s+R/
const TEXT_OP = /\bT[jJ]\b/
const IMAGE_OP = /\/\w+\s+Do\b/

type Located = { readonly body: string; readonly start: number }

function findObject(pdf: string, id: number): Located | undefined {
  const match = new RegExp(`(?<![0-9])${id}\\s+0\\s+obj([\\s\\S]*?)endobj`).exec(pdf)
  if (match?.[1] === undefined) return undefined
  return { body: match[1], start: match.index + match[0].indexOf(match[1]) }
}

function streamBytes(pdf: Uint8Array, located: Located): Uint8Array | undefined {
  const start = located.body.indexOf('stream')
  const end = located.body.lastIndexOf('endstream')
  if (start === -1 || end === -1) return undefined

  // `stream` 키워드 뒤 개행까지가 헤더다. latin1 로 읽어서 문자 인덱스가 바이트와 1:1 이다.
  let from = located.start + start + 'stream'.length
  if (pdf[from] === 0x0d) from += 1
  if (pdf[from] === 0x0a) from += 1

  return pdf.subarray(from, located.start + end)
}

/** 1부터 세는 빈 장 번호. */
export function blankPages(pdf: Uint8Array): readonly number[] {
  // PDF 는 바이너리지만 구조는 ASCII 다. latin1 은 바이트를 잃지 않고 인덱스도 보존한다.
  const text = Buffer.from(pdf).toString('latin1')
  const blank: number[] = []

  PAGE_MARKER.lastIndex = 0
  let pageNumber = 0
  for (let match = PAGE_MARKER.exec(text); match !== null; match = PAGE_MARKER.exec(text)) {
    pageNumber += 1

    // dict 는 이 객체의 `obj` 부터 `endobj` 까지다. 앞으로 더 넓히면 **직전 페이지 객체의
    // `/Contents` 를 읽는다** — 그러면 모든 장이 앞 장의 내용을 가진 것처럼 보인다.
    const objectStart = text.lastIndexOf(' obj', match.index)
    const dict = text.slice(objectStart, text.indexOf('endobj', match.index))

    const ref = CONTENTS_REF.exec(dict)
    if (ref?.[1] === undefined) {
      blank.push(pageNumber)
      continue
    }

    const located = findObject(text, Number(ref[1]))
    if (located === undefined) continue

    const raw = streamBytes(pdf, located)
    if (raw === undefined) {
      blank.push(pageNumber)
      continue
    }

    let content: string
    try {
      content = Buffer.from(inflateSync(raw)).toString('latin1')
    } catch {
      // 압축이 아니면 그대로 읽는다. 풀리지도 읽히지도 않으면 판단을 보류한다.
      content = Buffer.from(raw).toString('latin1')
    }

    if (!TEXT_OP.test(content) && !IMAGE_OP.test(content)) blank.push(pageNumber)
  }

  return blank
}
