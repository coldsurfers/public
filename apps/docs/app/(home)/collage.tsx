'use client'
import { PinCard } from '@coldsurfers/surf-ui/cards'
import { Button, Chip, IconButton } from '@coldsurfers/surf-ui/primitives'
import type { CSSProperties, ReactNode } from 'react'

/**
 * 포스터 자리표시 — 시안 v3 원칙 5 의 그라데이션 넷(Figma 1455:250). 글자를 넣지 않는다.
 * DS `PinCard` 에 이 축이 생기면 이 표는 지운다.
 */
const TONE = {
  lavender: 'linear-gradient(160deg, #cdd3ff, #ecdcf8)',
  peach: 'linear-gradient(160deg, #f7dcbd, #eeb183)',
  mint: 'linear-gradient(160deg, #c4e7b6, #e5f3da)',
  plum: 'linear-gradient(160deg, #2d2944, #5c4c7e)',
} as const

type Tone = keyof typeof TONE

/** 히어로 둘레에 띄우는 것 하나 — 자리(%)와 그 자리에 놓이는 것. */
interface Slot {
  at: Pick<CSSProperties, 'top' | 'left' | 'right'>
  node: ReactNode
}

function Poster({ tone, width, height }: { tone: Tone; width: number; height: number }) {
  return (
    <span
      aria-hidden
      className="block rounded-(--surf-radius-poster)"
      style={{ width, height, background: TONE[tone] }}
    />
  )
}

/**
 * 가운데 제목 둘레에 실제 DS 부품과 포스터를 띄운다 — 그림이 아니라 발행본을 import 한 것이다.
 * 장식이라 `inert` 로 감싸 포커스 · 스크린리더에서 뺀다.
 */
const HERO_SLOTS: Slot[] = [
  { at: { top: '4%', left: '14%' }, node: <Poster tone="lavender" width={104} height={152} /> },
  { at: { top: '22%', left: '2%' }, node: <Chip active>공연</Chip> },
  { at: { top: '38%', left: '0%' }, node: <Poster tone="mint" width={104} height={128} /> },
  { at: { top: '64%', left: '15%' }, node: <Poster tone="peach" width={96} height={96} /> },
  { at: { top: '8%', right: '2%' }, node: <Poster tone="plum" width={140} height={140} /> },
  {
    at: { top: '28%', right: '22%' },
    node: (
      <IconButton label="담기" variant="secondary" shape="pill" size="sm">
        ＋
      </IconButton>
    ),
  },
  { at: { top: '44%', right: '15%' }, node: <Poster tone="lavender" width={100} height={176} /> },
  {
    at: { top: '48%', right: '0%' },
    node: (
      <Button variant="accent" shape="pill" size="sm">
        방문하기
      </Button>
    ),
  },
]

export function HeroCollage({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[440px] items-center justify-center">
      <div inert className="absolute inset-0 hidden md:block">
        {HERO_SLOTS.map((slot, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 고정 배열이라 순서가 곧 정체다
          <span key={index} className="absolute" style={slot.at}>
            {slot.node}
          </span>
        ))}
      </div>
      <div className="relative z-1 flex max-w-md flex-col items-center gap-5 text-center">
        {children}
      </div>
    </div>
  )
}

/** 「누구를 위한가」 옆 — 겹친 핀 셋, 가운데 한 장은 실제 `PinCard` 에 저장 표시. */
export function TeamCollage() {
  return (
    <div inert className="relative mx-auto h-[300px] w-[320px]">
      <span className="absolute top-0 left-6">
        <Poster tone="peach" width={130} height={150} />
      </span>
      <span className="absolute top-24 left-0">
        <Poster tone="lavender" width={120} height={170} />
      </span>
      <span className="absolute top-14 right-0">
        <Poster tone="plum" width={110} height={150} />
      </span>
      <span className="absolute top-8 left-[90px] w-[150px] rounded-[20px] bg-(--surf-bg-base) p-1.5 shadow-lg">
        <PinCard
          meta="/llms/patterns/pin-card.txt"
          fallback={
            <span
              className="absolute inset-0 rounded-(--surf-radius-poster)"
              style={{ background: TONE.mint }}
            />
          }
        >
          PinCard
        </PinCard>
        <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-(--surf-selected-fill) text-sm text-(--surf-selected-text)">
          ✓
        </span>
      </span>
    </div>
  )
}
