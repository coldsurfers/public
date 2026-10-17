'use client'
import { Button } from '@coldsurfers/surf-ui/primitives'
import type { ReactNode } from 'react'
import { useCopy } from '@/lib/use-copy'

export interface AgentStepsProps {
  /** 에이전트에게 그대로 붙여 넣는 한 단락. */
  prompt: string
  /** MCP 서버를 붙이는 한 줄. */
  mcpCommand: string
}

/**
 * 에이전트에게 이 문서를 물리는 세 단계 — 붙여 넣기 · 물리기 · 읽히기.
 */
export function AgentSteps({ prompt, mcpCommand }: AgentStepsProps) {
  return (
    <ol className="grid rounded-(--surf-radius-panel) bg-(--surf-bg-alt) p-5 sm:grid-cols-3">
      <Step index="01" title="붙여 넣기" action={<CopyButton label="프롬프트" value={prompt} />}>
        {prompt}
      </Step>
      <Step index="02" title="물리기" action={<CopyButton label="MCP 명령" value={mcpCommand} />}>
        <code className="font-mono">{mcpCommand}</code>
      </Step>
      <Step
        index="03"
        title="읽히기"
        action={
          <Button asChild size="sm" shape="pill" variant="outline">
            <a href="/llms.txt">llms.txt</a>
          </Button>
        }
      >
        색인 하나에서 페이지마다 예제 · props · 토큰 값이 든 평문 사본으로 이어집니다.
      </Step>
    </ol>
  )
}

function Step({
  index,
  title,
  action,
  children,
}: {
  index: string
  title: string
  action: ReactNode
  children: ReactNode
}) {
  return (
    <li className="flex flex-col gap-2 border-(--surf-line-divider) py-4 not-last:border-b sm:px-4 sm:py-0 sm:first:ps-0 sm:last:pe-0 sm:not-last:border-e sm:not-last:border-b-0">
      <span className="text-xs font-bold text-(--surf-kicker)">{index}</span>
      <span className="font-bold">{title}</span>
      <span className="flex-1 text-xs leading-relaxed break-all text-(--surf-text-secondary) select-all">
        {children}
      </span>
      <span>{action}</span>
    </li>
  )
}

const COPY_LABEL = { idle: '복사', copied: '복사됨', failed: '복사 실패 — 직접 선택' } as const

function CopyButton({ label, value }: { label: string; value: string }) {
  const { state, copy } = useCopy()

  return (
    <Button
      size="sm"
      shape="pill"
      variant="outline"
      aria-label={`${label} 복사`}
      onClick={() => copy(value)}
    >
      <span aria-live="polite">{COPY_LABEL[state]}</span>
    </Button>
  )
}
