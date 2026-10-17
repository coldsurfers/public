'use client'
import { PinCard } from '@coldsurfers/surf-ui/cards'
import { Chip } from '@coldsurfers/surf-ui/primitives'
import Link from 'next/link'
import { useState } from 'react'
import { BOARDS, type BoardKey, type Pin, type PinTone } from '@/lib/pins'

/** 시안 v3 포스터 없는 핀의 색면 — Figma 1455:250 의 라벤더 · 복숭아 · 민트 · 자두 타일. */
const TONE: Record<PinTone, string> = {
  ink: 'bg-[linear-gradient(160deg,#1b1b1b,#3a3a3a)] text-white',
  lavender: 'bg-[linear-gradient(160deg,#d9d4ff,#efe6ff)] text-[#2b2560]',
  plum: 'bg-[linear-gradient(160deg,#2c2848,#5b4c80)] text-white',
  peach: 'bg-[linear-gradient(160deg,#f5c39a,#f6e6d4)] text-[#5b3317]',
  mint: 'bg-[linear-gradient(160deg,#b9e2ad,#e7f3dc)] text-[#1f4a1c]',
}

type Filter = BoardKey | 'all'

export function PinBoard({ pins }: { pins: Pin[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const boards = Object.keys(BOARDS) as BoardKey[]
  const shown = filter === 'all' ? pins : pins.filter((pin) => pin.board === filter)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          전체 {pins.length}
        </Chip>
        {boards.map((board) => (
          <Chip key={board} active={filter === board} onClick={() => setFilter(board)}>
            {BOARDS[board].label}
          </Chip>
        ))}
      </div>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 *:mb-5 *:break-inside-avoid">
        {shown.map((pin) => (
          <PinCard
            key={pin.href}
            meta={pin.meta}
            fallback={
              <span
                className={`absolute inset-0 flex items-end rounded-(--surf-radius-poster) p-4 text-left text-xl leading-tight ${TONE[BOARDS[pin.board].tone]}`}
              >
                {pin.title}
              </span>
            }
          >
            <Link href={pin.href}>{pin.title}</Link>
          </PinCard>
        ))}
      </div>
    </section>
  )
}
