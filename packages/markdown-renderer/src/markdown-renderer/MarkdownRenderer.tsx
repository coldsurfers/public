import { cx } from '@coldsurfers/design-system/primitives'
import rehypeShikiFromHighlighter from '@shikijs/rehype/core'
import type { ElementContent, Element as HastElement } from 'hast'
import { createContext, memo, type ReactNode, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkCjkFriendly from 'remark-cjk-friendly'
import remarkGfm from 'remark-gfm'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/langs/bash.mjs'
import css from 'shiki/langs/css.mjs'
import html from 'shiki/langs/html.mjs'
import json from 'shiki/langs/json.mjs'
import jsx from 'shiki/langs/jsx.mjs'
import md from 'shiki/langs/markdown.mjs'
import sh from 'shiki/langs/shellscript.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import ts from 'shiki/langs/typescript.mjs'
import githubLight from 'shiki/themes/github-light.mjs'
import { ImageLightbox } from '../image-lightbox'
import * as styles from './MarkdownRenderer.css'

// Shiki 하이라이터를 동기 싱글톤으로 만들어둔다. 매 렌더마다 만들면 비용이 크고,
// async 버전은 react-markdown의 rehype 파이프라인에서 처리가 까다롭다.
const shikiHighlighter = createHighlighterCoreSync({
  themes: [githubLight],
  langs: [ts, tsx, jsx, json, bash, sh, css, html, md],
  engine: createJavaScriptRegexEngine(),
})

/**
 * `<code>` 가 `<pre>` 안인지 알리는 신호.
 *
 * Shiki 변환을 거치면 블록 `<code>` 는 `language-*` 클래스를 잃는다(테마 클래스가 `<pre>` 로
 * 옮겨간다). 그래서 `className` 만 보면 인라인 코드와 구분이 안 되고, 인라인 코드 칩(배경·패딩)이
 * 코드블록 한가운데 그려진다. 부모가 알려주는 것 말고는 신호가 없다.
 */
const InsidePre = createContext(false)

/** 인라인 코드(`foo`)에만 사이트 룩의 칩을 입힌다. 블록 코드는 Shiki 가 이미 색을 박아둔 뒤다. */
function Code({ className, children }: { className?: string; children?: ReactNode }) {
  const insidePre = useContext(InsidePre)
  if (insidePre) return <code className={className}>{children}</code>
  return <code className={styles.inlineCode}>{children}</code>
}

export interface BandcampEmbedData {
  embedUrl: string
  width: number
  height: number
}

export interface OgCardData {
  url: string
  title: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
}

export interface ColdsurfTicket {
  sellerName: string
  url: string
  /** 예매 오픈 일시 (ISO, 선택). */
  openDate?: string
}

/** coldsurf.io 이벤트 임베드 데이터 — 빌드타임에 billets API 로 해소해 prop 으로 주입. */
export interface ColdsurfEventData {
  id: string
  title: string
  date: string
  /** coldsurf.io/event/<slug> — 외부 폴백 링크용 slug. */
  slug: string
  /** KOPIS 출처 데이터 여부 — true 면 출처 표기 필수. */
  isKOPIS: boolean
  venue?: string
  poster?: string
  tickets: ColdsurfTicket[]
}

/** KOPIS(공연예술통합전산망) 데이터 출처 표기 — billets-app `KOPIS_COPYRIGHT_TEXT` 와 동일 문구. */
export const KOPIS_COPYRIGHT_TEXT = '출처: (재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr)'

interface MarkdownRendererProps {
  content: string
  bandcampEmbeds?: Record<string, BandcampEmbedData>
  ogCards?: Record<string, OgCardData>
  /** coldsurf.io/event URL → 이벤트 데이터. 빌드타임 resolver 가 채운다. */
  coldsurfEvents?: Record<string, ColdsurfEventData>
}

// YouTube URL은 watch / 단축 / embed / shorts 등 여러 형태로 들어올 수 있어 각 패턴을 모두 다룬다.
// 매칭되지 않으면 null을 반환해 "YouTube가 아닌 일반 링크"임을 호출 측에 알린다.
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// 문단 안에 `**[링크](...)**`처럼 강조 안에 중첩된 앵커가 있을 수 있어 트리 전체를 재귀로 훑는다.
// 단순히 직계 자식만 보면 중첩 케이스에서 임베드를 놓치게 된다.
// react-markdown의 `p` 컴포넌트로 들어오는 node는 항상 hast Element라 children 타입은 ElementContent[].
function collectYouTubeIds(node: HastElement | undefined): string[] {
  if (!node?.children) return []
  const ids: string[] = []
  const walk = (n: ElementContent) => {
    if (n.type === 'element') {
      if (n.tagName === 'a') {
        const href = n.properties?.href
        if (typeof href === 'string') {
          const id = getYouTubeId(href)
          if (id) ids.push(id)
        }
      }
      n.children.forEach(walk)
    }
  }
  node.children.forEach(walk)
  return ids
}

// Bandcamp 앨범/트랙 URL: `https://<artist>.bandcamp.com/album|track/<slug>`.
function isBandcampUrl(url: string): boolean {
  return /^https?:\/\/[a-z0-9-]+\.bandcamp\.com\/(?:album|track)\/[^?#\s]+/i.test(url)
}

function collectBandcampUrls(node: HastElement | undefined): string[] {
  if (!node?.children) return []
  const urls: string[] = []
  const walk = (n: ElementContent) => {
    if (n.type === 'element') {
      if (n.tagName === 'a') {
        const href = n.properties?.href
        if (typeof href === 'string' && isBandcampUrl(href)) urls.push(href)
      }
      n.children.forEach(walk)
    }
  }
  node.children.forEach(walk)
  return urls
}

// Spotify URL: `https://open.spotify.com/{type}/{id}` (album, track, playlist, episode, show, artist).
// 임베드 path 는 `/embed/{type}/{id}` 로 1:1 매핑되므로 별도 resolver 가 필요 없다.
const SPOTIFY_URL =
  /^https?:\/\/open\.spotify\.com\/(album|track|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/

function getSpotifyEmbed(url: string): { type: string; id: string } | null {
  const match = url.match(SPOTIFY_URL)
  if (!match) return null
  return { type: match[1], id: match[2] }
}

function collectSpotifyEmbeds(node: HastElement | undefined): { type: string; id: string }[] {
  if (!node?.children) return []
  const out: { type: string; id: string }[] = []
  const walk = (n: ElementContent) => {
    if (n.type === 'element') {
      if (n.tagName === 'a') {
        const href = n.properties?.href
        if (typeof href === 'string') {
          const embed = getSpotifyEmbed(href)
          if (embed) out.push(embed)
        }
      }
      n.children.forEach(walk)
    }
  }
  node.children.forEach(walk)
  return out
}

// coldsurf.io 이벤트 URL: `https://coldsurf.io/event/<slug>`. 이벤트 메타(티켓·포스터 등)는
// URL 만으로 알 수 없어 빌드타임 resolver(scripts/resolve-coldsurf-events.ts)가 slug 로 해소해
// prop 맵에 채워둔다. 여기서는 맵 lookup 으로 티켓 카드를 렌더.
const COLDSURF_EVENT_URL = /^https?:\/\/(?:www\.)?coldsurf\.io\/event\/[^/?#]+/i

function isColdsurfEventUrl(url: string): boolean {
  return COLDSURF_EVENT_URL.test(url)
}

function collectColdsurfEventUrls(node: HastElement | undefined): string[] {
  if (!node?.children) return []
  const urls: string[] = []
  const walk = (n: ElementContent) => {
    if (n.type === 'element') {
      if (n.tagName === 'a') {
        const href = n.properties?.href
        if (typeof href === 'string' && isColdsurfEventUrl(href)) urls.push(href)
      }
      n.children.forEach(walk)
    }
  }
  node.children.forEach(walk)
  return urls
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}.${m}.${day}`
}

// coldsurf.io 이벤트 티켓 임베드 — Spotify/Bandcamp 임베드와 같은 결의 리치 카드.
// billets tickets[](멀티 셀러)를 노출하고, KOPIS 출처면 출처 표기를 함께 건다.
// 데이터 미해소(맵에 없음)면 페이지로 가는 일반 링크로 폴백.
function ColdsurfTicketEmbed({ url, event }: { url: string; event?: ColdsurfEventData }) {
  if (!event) {
    return (
      <div className={styles.fallbackBlock}>
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
          {url}
        </a>
      </div>
    )
  }
  return (
    <div className={styles.ticketCard}>
      <div className={styles.ticketHead}>
        {event.poster && (
          <img
            src={event.poster}
            alt={`${event.title} poster`}
            loading="lazy"
            className={styles.ticketPoster}
          />
        )}
        <div className={styles.ticketMeta}>
          <p className={styles.ticketDate}>{formatEventDate(event.date)}</p>
          <p className={styles.ticketTitle}>{event.title}</p>
          {event.venue && <p className={styles.ticketVenue}>{event.venue}</p>}
        </div>
        {/* 출처 브랜딩 — Bandcamp 의 'bc', Spotify 로고 자리. 티켓 데이터는 coldsurf.io 발. */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="COLDSURF"
          className={styles.ticketBrand}
        >
          <span aria-hidden className={styles.ticketBrandGlyph}>
            ◖
          </span>
          coldsurf
        </a>
      </div>
      {event.tickets.length > 0 && (
        <div className={styles.ticketList}>
          {event.tickets.map((ticket) => (
            <a
              key={ticket.url}
              href={ticket.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ticketRow}
            >
              <span className={styles.ticketSeller}>{ticket.sellerName}</span>
              <span className={styles.ticketOpenDate}>
                {ticket.openDate ? `${formatEventDate(ticket.openDate)} ` : ''}↗
              </span>
            </a>
          ))}
        </div>
      )}
      {event.isKOPIS && <p className={styles.ticketSource}>{KOPIS_COPYRIGHT_TEXT}</p>}
    </div>
  )
}

// Bandcamp는 임베드 iframe에 numeric `album=ID`를 요구하는데 페이지 URL엔 없다.
// 빌드타임에 scripts/resolve-bandcamp.ts가 og:video 메타에서 임베드 URL을 추출해두므로
// 여기서는 prop으로 전달된 맵을 lookup하여 iframe을 직접 렌더링한다.
function BandcampEmbed({ url, embed }: { url: string; embed?: BandcampEmbedData }) {
  if (!embed) {
    return (
      <div className={styles.fallbackBlock}>
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
          {url}
        </a>
      </div>
    )
  }

  return (
    <div className={styles.bandcampBlock}>
      <iframe
        src={embed.embedUrl}
        title="Bandcamp player"
        loading="lazy"
        width={embed.width}
        height={embed.height}
        seamless
        className={styles.bandcampFrame}
      />
    </div>
  )
}

function SpotifyEmbed({ type, id }: { type: string; id: string }) {
  // track 은 컴팩트 플레이어(152px) 가 자연스럽고, 나머지(album/playlist/episode/show/artist) 는
  // 트랙 리스트가 같이 보이는 full 플레이어(352px) 가 정보량을 가장 잘 전달한다.
  const height = type === 'track' ? 152 : 352
  return (
    <div className={styles.spotifyBlock}>
      <iframe
        src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator`}
        title="Spotify player"
        loading="lazy"
        width="100%"
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className={styles.spotifyFrame}
      />
    </div>
  )
}

function OgLinkCard({ card }: { card: OgCardData }) {
  // Notion 의 _bookmark block_ 톤. 좌측에 title/description/site, 우측에 thumbnail.
  // description 이 없거나 image 가 없는 경우는 자연스럽게 *작아지도록* layout 을 짰다.
  // 외부 도메인 fallback 으로 broken image 가 떠도 무너지지 않게 thumbnail 박스는 *기본 너비 0* + image 시 확장.
  let host = card.url
  try {
    host = new URL(card.url).host.replace(/^www\./, '')
  } catch {
    // 잘못된 URL 이면 그대로 노출.
  }
  return (
    <a href={card.url} target="_blank" rel="noopener noreferrer" className={styles.ogCard}>
      <div className={styles.ogBody}>
        <div className={styles.ogText}>
          <span className={styles.ogTitle}>{card.title}</span>
          {card.description ? (
            <span className={styles.ogDescription}>{card.description}</span>
          ) : null}
        </div>
        <div className={styles.ogSite}>
          {card.favicon ? (
            <img
              src={card.favicon}
              alt=""
              width={14}
              height={14}
              loading="lazy"
              className={styles.ogFavicon}
            />
          ) : null}
          <span className={styles.ogHost}>{card.siteName ?? host}</span>
        </div>
      </div>
      {card.image ? (
        <div className={styles.ogThumb}>
          <img src={card.image} alt="" loading="lazy" className={styles.ogThumbImage} />
        </div>
      ) : null}
    </a>
  )
}

function YouTubeEmbed({ id }: { id: string }) {
  // iframe을 absolute로 띄워 부모 박스(16:9) 비율을 그대로 따라가게 한다.
  return (
    <div className={styles.youTubeBlock}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={styles.youTubeFrame}
      />
    </div>
  )
}

function MarkdownRendererImpl({
  content,
  bandcampEmbeds,
  ogCards,
  coldsurfEvents,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkCjkFriendly]}
      rehypePlugins={[
        // 모든 heading 에 github 스타일 슬러그 id 를 SSR 단계에서 부여 → `#슬러그` 해시 딥링크가
        // JS 없이 동작. ToC/스크롤스파이는 이 id 를 그대로 참조한다.
        rehypeSlug,
        [
          rehypeShikiFromHighlighter,
          shikiHighlighter,
          // `themes` + `defaultColor` 의 dual 은 토큰마다 `--shiki-*` 변수를 하나씩 더 굽고,
          // 그걸 실제로 켜려면 소비자가 `.shiki span { color: var(--shiki-dark) !important }` 를
          // 따로 써야 한다. design-system 의 스킴은 light 하나뿐이라(ink 폐기) 살 자리가 없다.
          { theme: 'github-light' },
        ],
      ]}
      components={{
        // rehype-slug 가 넣어준 `id` 를 반드시 forward 해야 `#슬러그` 해시 딥링크가 동작한다.
        h1: ({ children, id }) => (
          <h1 id={id} className={styles.h1}>
            {children}
          </h1>
        ),
        h2: ({ children, id }) => (
          <h2 id={id} className={styles.h2}>
            {children}
          </h2>
        ),
        h3: ({ children, id }) => (
          <h3 id={id} className={styles.h3}>
            {children}
          </h3>
        ),
        p: ({ children, node }) => {
          // YouTube/Bandcamp/Spotify 임베드는 <div><iframe/></div> 구조라 <p> 안에 두면 브라우저가
          // 자동으로 <p>를 닫아 마크업이 깨진다. 따라서 <p> 바깥에서 분기 처리한다.
          const youTubeIds = collectYouTubeIds(node)
          const bandcampUrls = collectBandcampUrls(node)
          const spotifyEmbeds = collectSpotifyEmbeds(node)
          const coldsurfUrls = collectColdsurfEventUrls(node)

          // 케이스 1: 한 줄에 임베드 URL만 있는 경우(자동 링크화된 단독 앵커).
          // 링크 텍스트가 의미 없는 raw URL이므로 통째로 임베드로 치환한다.
          if (
            node?.children?.length === 1 &&
            node.children[0].type === 'element' &&
            node.children[0].tagName === 'a'
          ) {
            if (youTubeIds.length === 1) return <YouTubeEmbed id={youTubeIds[0]} />
            if (bandcampUrls.length === 1) {
              return (
                <BandcampEmbed url={bandcampUrls[0]} embed={bandcampEmbeds?.[bandcampUrls[0]]} />
              )
            }
            if (spotifyEmbeds.length === 1) {
              return <SpotifyEmbed type={spotifyEmbeds[0].type} id={spotifyEmbeds[0].id} />
            }
            if (coldsurfUrls.length === 1) {
              return (
                <ColdsurfTicketEmbed
                  url={coldsurfUrls[0]}
                  event={coldsurfEvents?.[coldsurfUrls[0]]}
                />
              )
            }
            // OG 카드는 *전용 임베드가 없는 외부 링크* 만 받는다. 위 3 개 분기가 모두 실패한 다음에야 폴백.
            const href = node.children[0].properties?.href
            if (typeof href === 'string') {
              const card = ogCards?.[href]
              if (card) return <OgLinkCard card={card} />
            }
          }

          // 케이스 2: 본문 중간에 `[설명](URL)`이 인라인으로 섞인 경우.
          // 텍스트 흐름은 보존해 링크로 두고, 임베드는 문단 아래에 블록으로 덧붙인다.
          if (
            youTubeIds.length > 0 ||
            bandcampUrls.length > 0 ||
            spotifyEmbeds.length > 0 ||
            coldsurfUrls.length > 0
          ) {
            return (
              <>
                <p className={styles.paragraph}>{children}</p>
                {youTubeIds.map((id, i) => (
                  <YouTubeEmbed key={`yt-${id}-${i}`} id={id} />
                ))}
                {bandcampUrls.map((url, i) => (
                  <BandcampEmbed key={`bc-${url}-${i}`} url={url} embed={bandcampEmbeds?.[url]} />
                ))}
                {spotifyEmbeds.map((embed, i) => (
                  <SpotifyEmbed key={`sp-${embed.id}-${i}`} type={embed.type} id={embed.id} />
                ))}
                {coldsurfUrls.map((url, i) => (
                  <ColdsurfTicketEmbed
                    key={`cs-${url}-${i}`}
                    url={url}
                    event={coldsurfEvents?.[url]}
                  />
                ))}
              </>
            )
          }

          return <p className={styles.paragraph}>{children}</p>
        },
        blockquote: ({ children }) => (
          <blockquote className={styles.blockquote}>{children}</blockquote>
        ),
        // 인라인/블록 판정 근거는 `language-*` 가 아니라 부모다 — 이유는 `InsidePre` 주석.
        code: ({ children, className }) => <Code className={className}>{children}</Code>,
        // Shiki 가 넣어준 `shiki` 클래스와 인라인 style 을 **둘 다** 유지한다 — 클래스에 토큰 색이,
        // style 에 코드 전체의 기본 전경색이 달려 있다(색 없는 토큰은 이걸 물려받는다).
        // `background-color` 만 걷어낸다: 블록 톤은 테마의 흰색이 아니라 `--code-bg`(인라인 코드와
        // 같은 톤)가 져야 하는데, 인라인 style 은 CSS 로 이길 수 없어 여기서 빼는 수밖에 없다.
        // `tabIndex` 는 가로 스크롤을 키보드로 잡게 해주는 Shiki 의 a11y 장치라 그대로 넘긴다.
        pre: ({ children, className, style, tabIndex }) => (
          <InsidePre value={true}>
            <pre
              className={cx(className, styles.pre)}
              style={{ ...style, backgroundColor: undefined }}
              tabIndex={tabIndex}
            >
              {children}
            </pre>
          </InsidePre>
        ),
        hr: () => <hr className={styles.hr} />,
        ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
        ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
        li: ({ children }) => <li className={styles.li}>{children}</li>,
        a: ({ href, children }) => (
          // `--link` 토큰이 본문 텍스트 색과 (다크에선 동일하게) 거의 같게 잡혀 있어서, 색만으로는
          // hover 전까지 링크인지 분간이 안 된다. 색 결정은 그대로 두되 *항상 보이는 옅은 밑줄* 로
          // 링크 affordance 를 준다(색에만 의존하지 않음 — WCAG). hover 시 본래의 빨강 강세로 전환.
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
        img: ({ src, alt }) => {
          if (typeof src !== 'string') return null
          return <ImageLightbox src={src} alt={alt} className={styles.image} />
        },
        table: ({ children }) => (
          <div className={styles.tableScroll}>
            <table className={styles.table}>{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className={styles.thead}>{children}</thead>,
        th: ({ children }) => <th className={styles.th}>{children}</th>,
        td: ({ children }) => <td className={styles.td}>{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// 스크롤로 인한 부모 re-render(예: PickDetail 의 activeToc state) 시 ReactMarkdown 트리가
// 다시 빌드되면서 YouTube/Bandcamp/Spotify iframe 이 remount → 재생이 멈추는 문제를 막는다.
// content 는 문자열, embed 맵들은 모듈 레벨 상수로 들어오므로 shallow 비교로 안전하게 bail-out.
export const MarkdownRenderer = memo(MarkdownRendererImpl)
