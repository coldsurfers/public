'use client'

import type { ReactNode, SVGProps } from 'react'

/**
 * `react-native-svg` 의 **문서 사이트 전용 대역**. 배선은 `next.config.mjs` 의
 * `resolveAlias` 가 건다 — `shims/safe-area-context.tsx` 와 같은 함정, 같은 처방이다.
 *
 * ## 왜 진짜 패키지가 못 서나
 *
 * 패키지에 `.web.js` 판이 있지만 **닿을 수가 없다.** 진입점을 `ReactNativeSVG.web.js` 로
 * 별칭 걸어도 그 파일이 `export * from './elements'` 를 **상대 경로**로 열고, `resolveAlias`
 * 는 모듈 지정자에만 걸려 상대 경로를 못 잡는다. 그래서 `elements.js`(native 판)로 풀리고
 * → `fabric/*NativeComponent` → RN 깊은 경로 `Libraries/Utilities/codegenNativeComponent`
 * → Flow 소스 파싱 실패다. turbopack 은 node_modules 에서 확장자 우선순위도 안 쓴다.
 *
 * ## 이게 미리보기의 정직함을 해치지 않는 이유
 *
 * RNSVG 의 web 판이 하는 일이 정확히 이것이다 — `Svg` → `<svg>`, `Circle` → `<circle>`.
 * 여기 쓰인 prop 은 전부 DOM SVG 속성과 이름이 같고, **원은 DS 가 계산한 좌표를 그대로
 * 받는다**(`contract/spinner.ts` 의 `getSpinnerGeometry`). 그래서 이 대역이 바꾸는 건
 * 렌더 경로뿐이고 치수·색·아크 각도는 DS 가 정한 값 그대로다.
 *
 * ## 무엇을 안 넣었나
 *
 * `Path` · `Rect` · `G` · `Defs` 류는 이 사이트에서 아무도 안 쓴다 — 지금 DS 의 svg 소비처는
 * `native/Spinner` 하나고 그게 `Svg` + `Circle` 둘만 쓴다. 쓰는 표면이 생기면 그때 더한다.
 */

export default function Svg({
  width,
  height,
  viewBox,
  children,
}: {
  width?: number | string
  height?: number | string
  viewBox?: string
  children?: ReactNode
}) {
  return (
    // 장식이다 — 접근성 이름은 DS `Spinner` 의 Root 가 `progressbar` 로 든다.
    <svg width={width} height={height} viewBox={viewBox} aria-hidden="true" role="presentation">
      {children}
    </svg>
  )
}

export function Circle(props: SVGProps<SVGCircleElement>) {
  return <circle {...props} />
}
