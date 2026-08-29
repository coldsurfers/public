import { type ColorScheme, nativeColor } from '../tokens/native'

/**
 * RN 에는 CSS 변수가 없다 — 웹에서 `var(--bg)` 하나로 끝나던 색 참조를 여기서는 훅이 든다.
 * 컴포넌트는 `useScheme()` 으로 색 **객체**를 받아 스타일에 직접 넣는다.
 *
 * **스킴은 light 하나뿐이라 컨텍스트가 아니다.** ink(dark) 폐기(paul-rockstar #299) 전에는
 * `ColorSchemeProvider` 가 `'light' | 'dark'` 를 받아 컨텍스트로 흘렸는데, 뒤집을 축이 사라진
 * 지금 그 프로바이더는 상수 하나를 감싸는 껍데기다. 훅 모양을 남겨 두는 건 호출부 7곳이
 * 이미 이 경계를 쓰고 있고, 스킴이 다시 생기면 여기 한 곳만 되돌리면 되기 때문이다.
 */
export const useScheme = (): ColorScheme => nativeColor.light
