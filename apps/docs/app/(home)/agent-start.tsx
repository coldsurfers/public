'use client'
import { Button } from '@coldsurfers/surf-ui/primitives'
import { useState } from 'react'

export interface AgentStartProps {
  /** 에이전트에게 그대로 붙여 넣는 한 단락. */
  prompt: string
  /** MCP 서버를 붙이는 한 줄. */
  mcpCommand: string
}

/** 사람이 읽기 전에 에이전트에게 먼저 넘기는 자리 — 프롬프트 복사와 MCP 한 줄. */
export function AgentStart({ prompt, mcpCommand }: AgentStartProps) {
  return (
    <section className="flex flex-col gap-3 rounded-(--surf-radius-panel) bg-(--surf-panel-fill) p-5">
      <p className="text-xs font-semibold text-(--surf-kicker)">에이전트로 시작하기</p>
      <CopyRow label="프롬프트" value={prompt} />
      <CopyRow label="MCP" value={mcpCommand} mono />
    </section>
  )
}

function CopyRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-3 rounded-(--surf-radius-row) bg-(--surf-row-fill) py-2 ps-4 pe-2">
      <span className="w-14 shrink-0 text-xs text-(--surf-text-secondary)">{label}</span>
      <span className={`min-w-0 flex-1 truncate text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
      <Button size="sm" variant="primary" shape="pill" onClick={copy}>
        {copied ? '복사됨' : '복사'}
      </Button>
    </div>
  )
}
