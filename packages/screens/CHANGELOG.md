# @coldsurfers/screens

## 0.1.0

### Minor Changes

- [#152](https://github.com/coldsurfers/public/pull/152) [`36484de`](https://github.com/coldsurfers/public/commit/36484de097e79b904e42f0611b45da7316523936) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/screens` 신설 — RN 화면의 조립층. DS 위에 얹는다.

  첫 멤버는 `AppScreen` 하나. 배경 · safe-area 여백 · 탭바 여백 · Suspense 경계를 든다.
  헤더(react-navigation)와 에러 경계(react-query)는 안 든다.

  여백은 `offsetTop`(`'none'`·`'safeArea'`) / `offsetBottom`(`'none'`·`'safeArea'`·`'tabBar'`)
  두 축이다. 탭바 높이는 DS `useTabBarHeight()` 를 읽어 인셋을 상수로 박지 않는다.
  `ViewProps` 를 extends 해서 `style`·`testID`·접근성 축은 루트로 통과한다.
