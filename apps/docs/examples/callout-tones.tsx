'use client'
import { Callout } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <Callout action={<a href="#terms">현행 보기 →</a>}>지난 버전을 보고 있습니다.</Callout>
      <Callout tone="success">저장했습니다.</Callout>
      <Callout tone="warning">예매 마감이 한 시간 남았습니다.</Callout>
      <Callout tone="danger" role="alert">
        로그인에 실패했습니다.
      </Callout>
    </div>
  )
}
