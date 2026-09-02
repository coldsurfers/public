'use client'
import { cn } from 'cnfast'
import { buttonVariants } from 'fumadocs-ui/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover'
import { ChevronDown, ExternalLinkIcon, FileTextIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * 페이지 헤더의 `Open ▾`.
 *
 * fumadocs 의 `ViewOptionsPopover` 를 그대로 쓰면 항목을 더할 수 없다 — 목록이 컴포넌트
 * 안에 박혀 있고 슬롯이 없다(업스트림도 "커스터마이즈하려면 가져다 쓰라"고 안내한다).
 * 그래서 팝오버·버튼 스타일만 라이브러리에서 빌려오고 **목록은 여기서 정한다**.
 *
 * 목록은 **이 페이지 하나**를 가리킨다. 맨 위가 이 페이지의 평문 사본이고 라벨이 파일 이름
 * 그대로다(`button.txt`). 사이트 전체인 `/llms.txt` · `/llms-full.txt` 는 여기 넣지 않는다 —
 * 루트에 있는 게 정본 진입점이고(색인은 원래 사이트 루트에서 줍는다), 페이지 맥락의 메뉴에
 * 섞으면 어느 게 이 페이지 것인지 흐려진다.
 */
export interface ViewOptionsProps {
  /** 이 페이지의 평문 사본 — `/llms/components/badge.txt` */
  markdownUrl: string
  githubUrl: string
}

export function ViewOptions({ markdownUrl, githubUrl }: ViewOptionsProps) {
  const items: { title: string; href: string; icon: ReactNode }[] = [
    { title: `Open ${fileName(markdownUrl)}`, href: markdownUrl, icon: <FileTextIcon /> },
    { title: 'Open in GitHub', href: githubUrl, icon: <GitHubIcon /> },
    {
      title: 'Open in ChatGPT',
      href: askUrl('https://chatgpt.com/?', markdownUrl),
      icon: <OpenAIIcon />,
    },
    {
      title: 'Open in Claude',
      href: askUrl('https://claude.ai/new?', markdownUrl),
      icon: <AnthropicIcon />,
    },
  ]

  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ color: 'secondary', size: 'sm' }), 'gap-2')}>
        Open
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4"
          >
            {item.icon}
            {item.title}
            <ExternalLinkIcon className="ms-auto size-3.5 text-fd-muted-foreground" />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  )
}

/** `/llms/components/button.txt` → `button.txt` */
function fileName(url: string) {
  return url.slice(url.lastIndexOf('/') + 1)
}

/**
 * AI 에게 넘기는 링크. **HTML 페이지가 아니라 평문 사본을 읽힌다** — 마크업을 주면
 * 토큰만 태우고 표·코드블록이 뭉개진다.
 */
function askUrl(base: string, markdownUrl: string) {
  const url =
    typeof window === 'undefined' ? markdownUrl : new URL(markdownUrl, location.origin).href
  const q = `Read ${url}, I want to ask questions about it.`

  return `${base}${new URLSearchParams({ q })}`
}

function GitHubIcon() {
  return (
    <svg fill="currentColor" role="img" viewBox="0 0 24 24">
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function OpenAIIcon() {
  return (
    <svg fill="currentColor" role="img" viewBox="0 0 24 24">
      <title>OpenAI</title>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  )
}

function AnthropicIcon() {
  return (
    <svg fill="currentColor" role="img" viewBox="0 0 24 24">
      <title>Anthropic</title>
      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
    </svg>
  )
}
