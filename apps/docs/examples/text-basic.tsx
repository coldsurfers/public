'use client'
import { Text } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <Text as="h2" textStyle="heading" weight="semibold" color="strong">
        이번 주말, 홍대
      </Text>
      <Text as="h3" textStyle="title" weight="medium" color="text">
        금요일 밤의 라인업
      </Text>

      <Text color="body">
        크기 하나가 아니라 역할 하나를 고릅니다. 행간과 자간이 그 역할에 맞게 같이 따라오므로, 같은
        자리에 선 글자는 지면이 달라도 같은 리듬으로 읽힙니다.
      </Text>

      <Text textStyle="bodySm" color="muted" maxLines={1}>
        maxLines 를 주면 그 줄에서 자르고 말줄임합니다 — 이 문장은 한 줄을 넘기므로 끝이 잘립니다.
      </Text>

      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Text as="span" textStyle="label" weight="medium" color="text">
          라벨
        </Text>
        <Text as="span" textStyle="labelSm" color="muted">
          21:00 입장
        </Text>
        <Text as="span" textStyle="micro" color="accent">
          매진 임박
        </Text>
      </div>
    </div>
  )
}
