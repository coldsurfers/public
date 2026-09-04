import { promises as fs } from 'node:fs'
import path from 'node:path'

/**
 * `examples/*.tsx` 원본 — 미리보기의 코드 블록과 평문 사본이 같은 파일을 읽는다.
 *
 * 렌더링은 이 파일을 실제로 import 해서 하므로(`components/preview.tsx`), 화면 · 코드 블록 ·
 * llms 평문 셋이 어긋나려면 파일이 둘이어야 하는데 하나다.
 */
export async function readExampleSource(name: string): Promise<string> {
  const source = await fs.readFile(path.join(process.cwd(), 'examples', `${name}.tsx`), 'utf8')

  return stripDirectives(source)
}

/** `'use client'` 지시문은 예제의 본질이 아니라 Next 사정이다 — 코드 블록에서 지운다. */
function stripDirectives(source: string): string {
  return source.replace(/^'use client'\n+/, '').trimEnd()
}
