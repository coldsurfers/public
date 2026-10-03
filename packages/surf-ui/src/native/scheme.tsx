import { useColorScheme } from 'react-native'
import { type ColorScheme, nativeColor } from '../tokens/native'

/**
 * RN 에는 CSS 변수가 없다 — 웹에서 `var(--bg)` 하나로 끝나던 색 참조를 여기서는 훅이 든다.
 * 컴포넌트는 `useScheme()` 으로 색 **객체**를 받아 스타일에 직접 넣는다.
 *
 * 스킴은 기기 설정(`useColorScheme`)을 따른다 — 웹의 `prefers-color-scheme` 과 같은 축이다.
 */
export const useScheme = (): ColorScheme =>
  useColorScheme() === 'dark' ? nativeColor.dark : nativeColor.light
