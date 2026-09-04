import styled from '@emotion/native'
import { Image } from 'react-native'
import { CONCERT_CARD_BARE_SPEC as bare, type ConcertCardBareProps } from '../contract'
import type { CoverTone } from '../tokens'
import { cover, paper } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 공연 카드 — 웹 `cards/ConcertCard` 의 **`bare` 섀시**를 RN 으로 옮긴 것.
 * 커버(포스터 or tone·이니셜) 4:3 한 장 + 그 아래 3줄 텍스트(제목 · 메타 · footer).
 *
 * ## 웹과 무엇이 같고 무엇이 다른가
 *
 * **같다 — prop 이름과 의미.** 한 글자도 다르지 않다. 그래서 인터페이스를 두 번 적지 않고
 * `contract/concert-card.ts` 의 `ConcertCardBareProps` 하나를 양쪽이 쓴다 — 이름이 갈리려면
 * 파일이 둘이어야 하는데 하나다.
 *
 * **다르다 — variant 축의 범위.** 웹은 `framed`·`bare`·`cover` 셋인데 여기는 `bare` 하나다.
 * 축을 좁힌 게 아니라 **아직 안 옮긴 것**이라 prop 자체를 두지 않았다 — 없는 prop 은 못 쓰지만
 * 있는데 안 먹는 prop 은 거짓말을 한다. 옮길 때 `variant` 를 열면 그때가 계약 확장이다.
 *
 * ## 웹 CSS 중 넘어오지 못한 것
 *
 * | 웹 | 여기 | 왜 |
 * | --- | --- | --- |
 * | `@media(tablet)` 로 커지는 gap·fontSize 6벌 | 모바일 값만 남긴다 | RN 엔 미디어 쿼리가 없고, 이 레인의 표면은 폰이다 |
 * | `lineClamp(n)` (`-webkit-line-clamp`) | `numberOfLines` | RN 이 같은 일을 prop 으로 한다 |
 * | `alpha(paper.warm, 20)` (`color-mix`) | `opacity: 0.2` | RN 엔 색 함수가 없어 노드 투명도로 낸다 |
 *
 * 치수는 **양쪽이 같은 표를 읽는다** — `contract/concert-card.ts` 의 `CONCERT_CARD_BARE_SPEC`.
 * 리스킨이 아니라 같은 시안을 다른 문법으로 다시 쓴 것이라 값이 갈리면 버그인데, 표를 물린
 * 지금은 **갈릴 수가 없다** — 여기 숫자를 손으로 적으면 그게 계약을 깨는 행위다.
 */
/**
 * props 는 **계약이 정본이다** — 웹과 글자 그대로 같아서 여기 다시 적지 않는다.
 * 웹에만 있는 `matchLabel`·`eyebrow`·`variant`·`className` 은 이 인터페이스에 없다.
 */
export type ConcertCardProps = ConcertCardBareProps

const Root = styled.View({
  flexDirection: 'column',
  gap: bare.gap,
})

const Cover = styled.View<{ $tone: CoverTone }>(({ $tone }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: bare.coverAspectRatio,
  borderRadius: bare.coverRadius,
  overflow: 'hidden',
  backgroundColor: cover[$tone],
}))

/** 커버를 채우는 것들(포스터 · 이니셜 판)이 공유하는 자리. 웹의 `inset: 0` 자리다. */
const Fill = styled.View({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  alignItems: 'center',
  justifyContent: 'center',
})

const CoverAction = styled.View({
  position: 'absolute',
  right: bare.coverActionInset,
  bottom: bare.coverActionInset,
})

const Meta = styled.View({
  flexDirection: 'column',
  gap: bare.metaGap,
})

export function ConcertCard({
  tone,
  initial,
  posterUrl,
  title,
  meta,
  footer,
  coverAction,
  reserveTitleLines = false,
}: ConcertCardProps) {
  const scheme = useScheme()

  return (
    <Root>
      <Cover $tone={tone}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            resizeMode="cover"
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        ) : (
          <Fill pointerEvents="none">
            <Text
              style={{
                fontSize: bare.initialFontSize,
                lineHeight: bare.initialFontSize,
                fontWeight: bare.titleFontWeight,
                color: paper.warm,
                opacity: bare.initialOpacity,
              }}
            >
              {initial}
            </Text>
          </Fill>
        )}
        {coverAction ? <CoverAction>{coverAction}</CoverAction> : null}
      </Cover>

      {/* 시안 meta — 제목(strong) / 날짜(text) / 공연장(footer, muted) 3줄. */}
      <Meta>
        <Text
          numberOfLines={bare.titleLines}
          style={{
            fontSize: bare.titleFontSize,
            lineHeight: bare.titleLineHeight,
            fontWeight: bare.titleFontWeight,
            color: scheme.strong,
            ...(reserveTitleLines ? { minHeight: bare.titleReservedHeight } : null),
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: bare.metaFontSize,
            lineHeight: bare.metaLineHeight,
            color: scheme.text,
          }}
        >
          {meta}
        </Text>
        {footer}
      </Meta>
    </Root>
  )
}
