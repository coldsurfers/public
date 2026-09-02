# @coldsurfers/markdown-renderer

## 0.2.0

### Minor Changes

- [#18](https://github.com/coldsurfers/public/pull/18) [`3a9119b`](https://github.com/coldsurfers/public/commit/3a9119bb065a0b41fc546be5386fea5db1360532) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/design-system` peer 를 `>=0.11.0` 으로 올린다. 그 아래 DS 는 진입점이 자기 CSS 를
  물고 오지 않아, 소비자가 `styles.css` 를 손으로 물지 않으면 이 패키지의 산문 규칙이 참조할
  변수가 없다. README 가 "이쪽 스타일시트만 물면 된다"고 말할 수 있는 근거가 이 범위다.

### Patch Changes

- Updated dependencies [[`e4420c7`](https://github.com/coldsurfers/public/commit/e4420c7db9a7c3cb4a5e1e606119d4dfdc73b143)]:
  - @coldsurfers/design-system@0.11.0

## 0.1.2

### Patch Changes

- [#16](https://github.com/coldsurfers/public/pull/16) [`c4efff3`](https://github.com/coldsurfers/public/commit/c4efff364fd7ab57f9d6b407c3dd7db342dd8238) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/design-system` peer 범위를 `>=0.3.0 <1.0.0` 으로 넓힌다. `^0.2.0` 은 0.x 캐럿이라
  `<0.3.0` 으로 해석돼 발행된 0.3.0 에서 unmet peer 가 났다.

## 0.1.1

### Patch Changes

- [#14](https://github.com/coldsurfers/public/pull/14) [`52b7e6e`](https://github.com/coldsurfers/public/commit/52b7e6e05f15f053100a01c36349f140e9bd958f) Thanks [@yungblud](https://github.com/yungblud)! - 코드블록이 깨져 보이던 세 가지를 고친다.

  - `pre` 오버라이드가 Shiki 의 인라인 `style`·`tabIndex` 를 버려서 코드 전체의 기본 전경색이 사라졌다. 이제 forward 한다 — `background-color` 만 걷어내고 블록 톤은 `--code-bg` 토큰(인라인 코드와 같은 톤)이 진다.
  - Shiki 변환 뒤 블록 `<code>` 는 `language-*` 클래스를 잃어 인라인 코드로 오판됐다. 인라인 코드 칩(배경·패딩·`font-size`)이 블록 한가운데 그려지던 것을 부모 신호(`InsidePre`)로 판정하게 바꾼다.
  - dual theme(`github-light` + `github-dark`, `defaultColor: 'dark'`)을 `github-light` 단일로 좁힌다. design-system 의 스킴은 light 하나뿐이라 다크 토큰 색이 warm-paper 위에 그대로 칠해지고 있었다. 토큰마다 굽던 `--shiki-*` 변수도 같이 사라진다.

## 0.1.0

### Minor Changes

- [#12](https://github.com/coldsurfers/public/pull/12) [`9a68a61`](https://github.com/coldsurfers/public/commit/9a68a61a1ff0e23fa06565af220efaeed536246b) Thanks [@yungblud](https://github.com/yungblud)! - 첫 발행. 마크다운 → COLDSURF 산문 표면(shiki 하이라이팅 · 미디어 임베드 · 이미지 라이트박스).

  `@coldsurfers/design-system` 에 얹지 않고 패키지를 가른 이유는 무게다. shiki 는 모듈 최상단
  부수효과(`createHighlighterCoreSync()`)라 번들러가 못 털고, DS 는 `cssCodeSplit: false` 라
  CSS 가 한 장이어서 산문 CSS 470 줄이 안 쓰는 소비자에게도 실린다. 갈라 두면 import 안 한
  소비자에겐 0 바이트다.

  무거운 의존(shiki · react-markdown · remark/rehype)은 번들에 넣지 않는다 — dist 는 28 kB.
  스타일시트는 DS 것과 **둘 다** 물어야 한다.

### Patch Changes

- Updated dependencies [[`9a68a61`](https://github.com/coldsurfers/public/commit/9a68a61a1ff0e23fa06565af220efaeed536246b)]:
  - @coldsurfers/design-system@0.3.0
