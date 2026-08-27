import styled from '@emotion/native'
import { ActivityIndicator } from 'react-native'
import { nativeSpacing } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 로딩 표시 — 웹 `primitives/Spinner` 와 **같은 prop 이름**(`size`·`label`)을 쓴다.
 *
 * 웹은 SVG 로 270° 아크를 직접 그리지만 RN 판은 플랫폼 인디케이터를 쓴다. 시안 아크를
 * 재현하려면 `react-native-svg` 를 peer 로 물어야 하는데, **로더 하나를 위해 소비자에게
 * 네이티브 의존을 하나 더 지우는 것**이라 그 값은 안 낸다. 색(accent)만 맞춘다.
 *
 * ⚠️ `size` 의 숫자는 **Android 에서만** 반영된다. iOS 의 `UIActivityIndicatorView` 는
 * 크기가 두 단계뿐이라 RN 이 `small`/`large` 로 접는다. 시안과 픽셀로 맞춰야 하는 자리면
 * 이 컴포넌트가 아니라 그 표면이 자기 로더를 든다.
 */
export interface SpinnerProps {
  /** 지름(px). 기본 30 — 웹과 같은 값. iOS 는 위 주의 참조. */
  size?: number
  /** 있으면 스피너 아래 muted 라벨을 렌더. 없으면 스피너만. */
  label?: string
}

const Root = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  gap: nativeSpacing[2],
})

export function Spinner({ size = 30, label }: SpinnerProps) {
  const scheme = useScheme()
  return (
    <Root accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size={size} color={scheme.accent} />
      {label ? (
        <Text size="sm" tone="muted">
          {label}
        </Text>
      ) : null}
    </Root>
  )
}
