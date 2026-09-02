/**
 * React primitives — Button · Chip · Badge · Field · Modal · …
 *
 * ⚠️ **흡수에는 상한이 있다.** 시안 컨트롤 높이가 34/35/36/46/48 다섯 종이라 그대로 받으면
 *    `Button.size` 가 7종이 된다 — 그건 추상화가 아니라 목록이다. variant 를 늘리기 전에
 *    *이 축이 이 컴포넌트의 것인가* 를 묻는다. 공개 패키지에선 그 규율이 곧 API 계약이다.
 *
 * 무엇이 들어오는가: 도메인 타입 · 라우터 · i18n 을 props/slot 으로 밀어낼 수 있고
 * 두 곳 이상에서 쓰이면 옮긴다. 한 곳뿐이면 두 번째 소비처가 생길 때까지 보류.
 */
export { Badge, type BadgeProps } from './Badge'
export { Button, type ButtonProps } from './Button'
export { Callout, type CalloutProps, type CalloutTone } from './Callout'
export { Checkbox, type CheckboxProps } from './Checkbox'
export { Chip, type ChipProps } from './Chip'
export { CoverBlock, type CoverBlockProps, coverTone } from './CoverBlock'
export { cx } from './cx'
export { Eyebrow, type EyebrowProps } from './Eyebrow'
export { Field, type FieldProps } from './Field'
export { Modal, type ModalPlacement, type ModalProps } from './Modal'
export { POPOVER_MENU_CLS, Popover, type PopoverProps } from './Popover'
export { Select, type SelectOption, type SelectProps } from './Select'
export {
  Skeleton,
  type SkeletonProps,
  type SkeletonRadius,
  type SkeletonTone,
} from './Skeleton'
export { Spinner, type SpinnerProps } from './Spinner'
export { ThinkingDots, type ThinkingDotsProps } from './ThinkingDots'
export { Ticket, type TicketOrientation, type TicketProps, ticketGround } from './Ticket'
export { type ToastApi, ToastProvider, type ToastTone, useToast } from './Toast'
export { TypewriterText, type TypewriterTextProps } from './TypewriterText'
export { type UseDialogBehaviorOptions, useDialogBehavior } from './useDialogBehavior'
