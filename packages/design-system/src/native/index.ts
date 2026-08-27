/**
 * React Native 레인 — emotion 구현. **웹 `./primitives` 와 같은 prop 계약을 따른다.**
 *
 * 왜 구현을 나눠야 했나: 웹은 vanilla-extract 라 산출물이 CSS 파일 + 클래스 이름 문자열인데,
 * RN 엔 그 둘을 받을 곳이 없다(`className` 도 스타일시트도 없다). 그래서 공유선은
 * **토큰 값(`../tokens/native`) + prop 계약**까지고, 스타일은 플랫폼마다 따로다.
 *
 * ⚠️ **이 트리에는 `.css.ts` 가 없어야 한다.** 하나라도 들어오면 VE 가 그걸 굽고
 *    RN 번들이 CSS 를 물게 된다. 같은 이유로 여기서 `../index` 를 import 하지 않는다 —
 *    그 배럴이 `theme.css`·`reset.css` 를 부수효과로 물고 있다.
 *
 * 축을 늘려야 하면 **웹부터 늘린다.** 여기서 먼저 늘리면 계약이 갈라진다.
 */
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button'
export { IconButton, type IconButtonProps, type IconButtonSize } from './IconButton'
export { Modal, type ModalProps } from './Modal'
export { Spinner, type SpinnerProps } from './Spinner'
export { ColorSchemeProvider, type SchemeName, useScheme } from './scheme'
export { Text, type TextProps, type TextTone } from './Text'
export { TextInput, type TextInputProps } from './TextInput'
export { type ToastApi, ToastProvider, type ToastTone, useToast } from './Toast'
