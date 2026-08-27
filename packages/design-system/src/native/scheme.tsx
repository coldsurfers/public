import { createContext, type ReactNode, useContext, useMemo } from 'react'
import { type ColorScheme, nativeColor } from '../tokens/native'

/**
 * RN 에는 CSS 변수가 없다 — 웹에서 `var(--bg)` 하나로 끝나던 스킴 전환을 여기서는
 * 컨텍스트가 든다. 컴포넌트는 `useScheme()` 으로 색 **객체**를 받아 스타일에 직접 넣는다.
 *
 * **기본값이 `light` 라 프로바이더 없이도 화면이 나온다.** emotion 의 `ThemeProvider` 를
 * 쓰지 않은 이유가 이것이다 — 그쪽은 감싸지 않으면 `theme` 이 `{}` 라 색이 전부 `undefined`
 * 가 되고, RN 은 그걸 조용히 투명으로 그린다. 빌드도 타입도 통과한 채 화면만 비는 실패라
 * 기본값을 갖는 컨텍스트로 그 경로 자체를 없앤다.
 *
 * 시스템 다크모드를 따르려면 소비 앱이 RN 의 `useColorScheme()` 을 읽어 넘긴다 —
 * *언제 뒤집을지* 는 앱의 정책이지 DS 의 값이 아니다.
 */
export type SchemeName = 'light' | 'dark'

const SchemeContext = createContext<ColorScheme>(nativeColor.light)

export function ColorSchemeProvider({
  scheme = 'light',
  children,
}: {
  scheme?: SchemeName
  children: ReactNode
}) {
  const value = useMemo(() => nativeColor[scheme], [scheme])
  return <SchemeContext.Provider value={value}>{children}</SchemeContext.Provider>
}

export const useScheme = (): ColorScheme => useContext(SchemeContext)
