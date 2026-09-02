import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/source'

export const revalidate = false

/**
 * 정적 인덱스 — 서버 검색 라우트가 아니라 **빌드 산출물 한 장**이다.
 * `staticClient` 가 이걸 받아 브라우저에서 계산한다. Cloudflare static assets 에 그대로 올라간다.
 */
export const { staticGET: GET } = createFromSource(source)
