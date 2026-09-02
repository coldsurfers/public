import { notFound } from 'next/navigation'
import { getLLMText, getPageMarkdownUrl, source } from '@/lib/source'

export const revalidate = false

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params
  // 뒤에 붙인 "content.md" 를 걷어낸다
  const page = source.getPage(slug?.slice(0, -1))
  if (!page) notFound()

  return new Response(await getLLMText(page), {
    headers: { 'Content-Type': 'text/markdown' },
  })
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: getPageMarkdownUrl(page).segments }))
}
