/**
 * 문서 목록과 본문 — **정본은 사이트다.** 이 패키지는 아무 내용도 들고 있지 않다.
 *
 * `design.coldsurf.io` 는 이미 `llms.txt`(색인)와 `/llms/<경로>.txt`(본문)를 굽는다.
 * 여기에 문서를 번들하면 발행 시점에 얼어붙어, 사이트가 앞서갈 때 조용히 옛말을 하게 된다.
 * 그래서 읽어오기만 하고, 대신 프로세스가 사는 동안만 짧게 캐시한다.
 */
const BASE = (process.env.COLDSURF_DOCS_URL ?? 'https://design.coldsurf.io').replace(/\/+$/, '')

/** 문서는 자주 바뀌지 않지만, 세션이 몇 시간씩 살아 있을 수 있다. */
const TTL = 5 * 60 * 1000

export interface DocEntry {
  /** `get_doc` 에 그대로 넣는 값 — `components/button` · `index`. */
  path: string
  title: string
  description: string
  /** 최상위 문서(`index` · `tailwind`)에는 없다. */
  category?: string
}

const cache = new Map<string, { text: string; at: number }>()

async function fetchText(url: string): Promise<string> {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < TTL) return hit.text

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} 를 읽지 못했다: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()
  cache.set(url, { text, at: Date.now() })

  return text
}

/** `llms.txt` 의 목록 한 줄 — `- [Button](/llms/components/button.txt): 설명.` */
const ENTRY = /^\s*-\s*\[([^\]]+)\]\(\/llms\/(.+?)\.txt\):\s*(.*)$/

export async function listDocs(): Promise<DocEntry[]> {
  const index = await fetchText(`${BASE}/llms.txt`)
  const entries: DocEntry[] = []

  for (const line of index.split('\n')) {
    const match = ENTRY.exec(line)
    if (!match) continue

    const [, title, path, description] = match
    const [head, ...rest] = path.split('/')

    entries.push({ path, title, description, category: rest.length > 0 ? head : undefined })
  }

  return entries
}

/**
 * 본문 하나. **경로는 색인에 있는 것만 연다.**
 *
 * 임의 경로를 그대로 URL 로 만들면 `../robots.txt` 같은 걸 문서인 척 돌려주게 된다.
 * 색인과 대조하면 그 문이 닫히고, 덤으로 오타에 「없다」 대신 「이 중에 있다」 를 답할 수 있다.
 */
export async function getDoc(path: string): Promise<string> {
  const wanted = path.replace(/^\/+|\/+$/g, '').replace(/\.txt$/, '')
  const entries = await listDocs()

  if (!entries.some((entry) => entry.path === wanted)) {
    throw new Error(
      `\`${path}\` 라는 문서는 없다. list_docs 로 경로를 확인해라 — ${entries
        .map((entry) => entry.path)
        .join(', ')}`,
    )
  }

  return fetchText(`${BASE}/llms/${wanted}.txt`)
}
