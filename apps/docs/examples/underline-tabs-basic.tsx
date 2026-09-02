'use client'
import { UnderlineTab, UnderlineTabs } from '@coldsurfers/design-system/primitives'
import { useState } from 'react'

const TABS = ['전체', 'Reviews', 'Picks']

export default function Example() {
  const [tab, setTab] = useState('전체')

  return (
    <UnderlineTabs style={{ gap: 28 }}>
      {TABS.map((label) => (
        <UnderlineTab key={label} active={tab === label} onClick={() => setTab(label)}>
          {label}
        </UnderlineTab>
      ))}
    </UnderlineTabs>
  )
}
