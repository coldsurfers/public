import styled from '@emotion/native'
import { Image } from 'react-native'
import {
  CONCERT_CARD_BARE_SPEC as bare,
  type ConcertCardBareProps,
  type ConcertCardCoverRatio,
} from '../contract'
import { ink, nativeColor, nativeFontFamily } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 공연 카드 — 웹 `cards/ConcertCard` 의 **`bare` 섀시**를 RN 으로 옮긴 것.
 * 커버(`note` 면 + 이니셜, 그 위 포스터) 4:3 한 장 + 그 아래 3줄 텍스트(제목 · 메타 · footer).
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

/**
 * 커버 바닥 — **면이 하나다.** 웹 `CoverBlock` 의 기본 톤(`note`)과 같은 자리고, 값은 각자
 * 자기 축에서 읽는다(웹 `vars.color.surfaceHover` · 여기 `nativeColor.light.surfaceHover`).
 * `cover` 6톤 축은 걷어냈다 — 이 면이 뜻하는 건 「아직 그림이 없다」라서 `Skeleton`(API 대기)과
 * 밝기가 갈리면 안 된다.
 */
const Cover = styled.View<{ $ratio: ConcertCardCoverRatio }>(({ $ratio }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: bare.coverAspectRatio[$ratio],
  borderRadius: bare.coverRadius,
  overflow: 'hidden',
  backgroundColor: nativeColor.light.surfaceHover,
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
  initial,
  posterUrl,
  title,
  meta,
  footer,
  coverAction,
  coverRatio = 'landscape',
  reserveTitleLines = false,
}: ConcertCardProps) {
  const scheme = useScheme()

  return (
    <Root>
      <Cover $ratio={coverRatio}>
        {/* 바닥 — 포스터가 덮지 못하면 이게 드러난다. 순서가 곧 층이다(웹과 같다).
            접근성 트리에서 빼는 건 이게 **장식**이라서다 — 제목은 아래 텍스트가 이미 말하는데
            자모 한 글자가 그 앞에서 읽히면 같은 말을 두 번 한다. `pointerEvents` 는 터치만
            막지 리더에선 안 빠지므로 두 플랫폼 플래그를 같이 단다(웹 `aria-hidden` 짝). */}
        <Fill
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text
            style={{
              fontSize: bare.initialFontSize,
              lineHeight: bare.initialFontSize,
              fontWeight: bare.initialFontWeight,
              color: ink.base,
              opacity: bare.initialOpacity,
            }}
          >
            {initial}
          </Text>
        </Fill>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            resizeMode="cover"
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        ) : null}
        {coverAction ? <CoverAction>{coverAction}</CoverAction> : null}
      </Cover>

      {/* 시안 meta — 제목(`text`) / 날짜(mono·`muted`) / 공연장(`footer` 슬롯) 3줄.
          셋째 줄 색은 DS 가 안 정한다 — 슬롯이라 소비처가 준 노드를 그대로 그린다. */}
      <Meta>
        <Text
          numberOfLines={bare.titleLines}
          style={{
            fontSize: bare.titleFontSize,
            lineHeight: bare.titleLineHeight,
            fontWeight: bare.titleFontWeight,
            // 웹 `bareTitle` 과 같은 판정 — 제목이 `strong` 이면 명도 사다리가 위에서
            // 한 칸 빈다(사다리 전체는 계약 `titleFontWeight` 주석에).
            color: scheme.text,
            ...(reserveTitleLines ? { minHeight: bare.titleReservedHeight } : null),
          }}
        >
          {title}
        </Text>
        {/* 날짜 스탬프 — mono. 웹 `bareLine` 과 같은 표를 읽는다. */}
        <Text
          numberOfLines={1}
          style={{
            fontFamily: nativeFontFamily[bare.metaFontFamily],
            fontSize: bare.metaFontSize,
            lineHeight: bare.metaLineHeight,
            color: scheme.muted,
          }}
        >
          {meta}
        </Text>
        {footer}
      </Meta>
    </Root>
  )
}
