import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import pkg from '../package.json' with { type: 'json' }
import { type DocEntry, getDoc, listDocs } from './docs.js'

/**
 * 툴은 셋이다 — 「구조를 본다 · 목록을 받는다 · 하나를 읽는다」.
 *
 * 섹션이 하나뿐이라 더 쪼갤 축이 없다. 카테고리 목록조차 하드코딩하지 않고 `llms.txt` 에서
 * 세는데, 그래야 문서를 늘렸을 때 이 패키지를 다시 발행하지 않아도 된다.
 */
export function createServer(): McpServer {
  const server = new McpServer(
    { name: 'coldsurf-design-system-docs', version: pkg.version },
    { capabilities: { tools: {} } },
  )

  server.registerTool(
    'discover_docs',
    {
      description:
        'Discover the structure of the COLDSURF design system documentation. ' +
        'Call this first to learn which categories exist before using list_docs or get_doc. ' +
        'The documentation is written in Korean.',
    },
    async () => {
      const entries = await listDocs()

      return text({
        site: 'https://design.coldsurf.io',
        total: entries.length,
        categories: summarize(entries),
        usage: [
          'list_docs({ category: "components" }) — 카테고리 안의 문서 목록',
          'get_doc({ path: "components/button" }) — 예제 코드 · props 표 · 토큰 값이 들어간 본문',
        ],
      })
    },
  )

  server.registerTool(
    'list_docs',
    {
      description:
        'List the COLDSURF design system documents — title, path, and one-line description. ' +
        'Pass a category to narrow it down; omit it to list everything.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe('e.g. "foundations", "components", "patterns". Omit to list all documents.'),
      },
    },
    async ({ category }) => {
      const entries = await listDocs()
      const picked = category ? entries.filter((entry) => entry.category === category) : entries

      return text({ total: picked.length, docs: picked })
    },
  )

  server.registerTool(
    'get_doc',
    {
      description:
        'Get one COLDSURF design system document as markdown. ' +
        'Includes the runnable example source, the props table generated from the package types, ' +
        'and the design token values — all read from the shipped package, not transcribed by hand.',
      inputSchema: {
        path: z.string().describe('Document path from list_docs, e.g. "components/button".'),
      },
    },
    async ({ path }) => ({ content: [{ type: 'text' as const, text: await getDoc(path) }] }),
  )

  return server
}

/** 카테고리 → 문서 수. 목록의 정본이 `llms.txt` 라 여기서 셀 수밖에 없다. */
function summarize(entries: DocEntry[]) {
  const counts = new Map<string, number>()

  for (const entry of entries) {
    const key = entry.category ?? '(root)'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts].map(([category, count]) => ({ category, count }))
}

function text(payload: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }] }
}
