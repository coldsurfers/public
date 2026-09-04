import { tokenVarName } from '@coldsurfers/design-system/tokens'
import { readExampleSource } from './example-source'
import { collectProps, type PropEntry, type PropsQuery } from './props-source'
import type { source } from './source'
import { TOKEN_SCALES, type TokenGroup } from './token-scales'

type Page = (typeof source)['$inferPage']

/**
 * 페이지 하나의 평문 사본 — `/llms/components/badge.txt` 의 본문.
 *
 * 처리된 마크다운에는 `<Preview />` · `<Props />` · `<Swatches />` 가 태그인 채로 남는다.
 * 그런데 **에이전트가 가장 원하는 셋(예제 코드 · props · 토큰 값)이 정확히 그 세 자리**다 —
 * 태그만 주면 구멍을 준 셈이라, 화면이 그리는 것과 같은 데이터를 마크다운으로 펼쳐 끼운다.
 *
 * 펼치는 데이터는 화면과 같은 모듈에서 온다(`props-source` · `token-scales` · `example-source`).
 * 여기서 값을 옮겨 적으면 정본이 둘이 되고, 그 순간 한쪽이 조용히 거짓말을 시작한다.
 */
export async function getLLMText(page: Page) {
  const processed = await page.data.getText('processed')

  return `# ${page.data.title} (${page.url})\n\n${await expand(processed)}`
}

/** 자기닫음 MDX 태그. 본문을 잃는 셋만 상대한다 — `<Callout>` 은 내용이 그대로 남아 건드리지 않는다. */
const TAG = /<(Preview|Props|Swatches)\s+([^>]*?)\/>/g

async function expand(markdown: string): Promise<string> {
  const matches = [...markdown.matchAll(TAG)]
  const blocks = await Promise.all(
    matches.map(([, tag, attrs]) => render(tag as Tag, parseAttrs(attrs))),
  )

  let out = ''
  let cursor = 0
  for (const [index, match] of matches.entries()) {
    out += markdown.slice(cursor, match.index) + blocks[index]
    cursor = match.index + match[0].length
  }

  return out + markdown.slice(cursor)
}

type Tag = 'Preview' | 'Props' | 'Swatches'

function render(tag: Tag, attrs: Record<string, string>): Promise<string> | string {
  if (tag === 'Preview') return previewBlock(attrs.name)
  if (tag === 'Props') return propsBlock(attrs as unknown as PropsQuery)
  return swatchesBlock(attrs.group as TokenGroup)
}

/** 문자열 속성만 읽는다. `padded={false}` 같은 표현식은 평문에 옮길 게 없다. */
function parseAttrs(attrs: string): Record<string, string> {
  return Object.fromEntries(
    [...attrs.matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, value]),
  )
}

async function previewBlock(name: string): Promise<string> {
  return `\`\`\`tsx\n${await readExampleSource(name)}\n\`\`\``
}

async function propsBlock(query: PropsQuery): Promise<string> {
  const table = await collectProps(query)
  if (!table) return ''

  const rows = table.entries.map(
    (entry) =>
      `| \`${entry.name}${entry.required ? '' : '?'}\` | ${code(entry.type)} | ${
        entry.defaultValue ? code(entry.defaultValue) : '—'
      } | ${description(entry)} |`,
  )
  const footnote = table.inherited
    ? `\n\n그 밖의 \`${table.inherited}\` 속성은 루트 엘리먼트로 그대로 통과한다.`
    : ''

  return `| prop | 타입 | 기본값 | 설명 |\n| --- | --- | --- | --- |\n${rows.join('\n')}${footnote}`
}

function swatchesBlock(group: TokenGroup): string {
  const rows = Object.entries(TOKEN_SCALES[group]).map(
    ([key, value]) => `| \`--${tokenVarName(group, key)}\` | ${code(value)} |`,
  )

  return `| 토큰 | 값 |\n| --- | --- |\n${rows.join('\n')}`
}

function description(entry: PropEntry): string {
  const text = (entry.description ?? '').replace(/\s+/g, ' ').trim()

  return escapeCell(entry.deprecated ? `**deprecated.** ${text}`.trim() : text) || '—'
}

/** 표 한 칸의 코드 조각. union 의 `|` 가 셀 경계로 읽히지 않게 막는다. */
function code(value: string): string {
  return `\`${escapeCell(value)}\``
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|')
}
