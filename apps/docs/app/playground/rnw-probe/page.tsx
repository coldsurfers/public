'use client'

import { Button } from '@coldsurfers/design-system/native/Button'
import { Text } from '@coldsurfers/design-system/native/Text'
import { View } from 'react-native'

/**
 * RNW 배선 프로브 — **시안이 아니라 검증판**이다.
 *
 * 묻는 것 하나: `@coldsurfers/design-system/native` 를 고치지 않고 브라우저에서 그릴 수 있는가.
 * 그래서 여기서는 RN 용으로 쓴 컴포넌트를 **그대로** 부른다 — `View` 도 `react-native` 에서
 * 가져온다(`next.config.mjs` 의 별칭이 `react-native-web` 으로 푼다).
 *
 * 이게 그려지면 native 레인을 포팅해도 **보면서** 할 수 있다는 뜻이고,
 * 안 그려지면 포팅해도 시안에선 확인이 안 된다.
 *
 * import 를 배럴이 아니라 **서브패스**(`/native/Button`)로 쓰는 것도 일부러다 — RN 소비처가
 * 번들을 아끼려면 저렇게 열어야 하고(Metro 는 tree-shaking 이 없다), 여기서 쓰면 그 경로가
 * 실제로 열린다는 게 **문서 빌드로 보증**된다. 배럴 쪽은 `/playground/coldsurf-mobile` 이 문다.
 */
export default function RnwProbePage() {
  return (
    <View style={{ padding: 32, gap: 16, alignItems: 'flex-start' }}>
      <Text size="2xl" weight="semibold" tone="strong">
        RNW 배선 프로브
      </Text>
      <Text size="sm" tone="muted">
        아래 버튼 넷은 `design-system/native` 의 `Button` 이다. RN 용 코드가 그대로 돈다.
      </Text>
      <Button variant="primary">primary</Button>
      <Button variant="accent">accent</Button>
      <Button variant="outline">outline</Button>
      <Button variant="ghost">ghost</Button>
    </View>
  )
}
