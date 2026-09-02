'use client'
import { Chip } from '@coldsurfers/design-system/primitives'
import { useState } from 'react'

const FILTERS = ['오늘', '이번 주', '이번 달']

export default function Example() {
  const [picked, setPicked] = useState('오늘')

  return (
    <>
      {FILTERS.map((label) => (
        <Chip key={label} active={picked === label} onClick={() => setPicked(label)}>
          {label}
        </Chip>
      ))}
      <Chip as="span" size="sm">
        슈게이즈
      </Chip>
    </>
  )
}
