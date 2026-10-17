'use client'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import SearchDialog from '@/components/search'

/** 홈은 시안 v3 light 면 그대로라 다크 짝이 없다 — nav 까지 light 로 고정해 면이 갈리지 않게 한다. */
export function Provider({ children }: { children: ReactNode }) {
  const forcedTheme = usePathname() === '/' ? 'light' : undefined

  return (
    <RootProvider search={{ SearchDialog }} theme={{ defaultTheme: 'light', forcedTheme }}>
      {children}
    </RootProvider>
  )
}
