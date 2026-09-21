---
'@coldsurfers/design-system': major
---

커버 면을 `note` 하나로 접는다 — 공연 카드에서 `tone` 축을 걷어낸다.

`Skeleton`(API 대기)은 `#eef2f7` 로 밝은데 `CoverBlock`(이미지 대기·부재·실패)은 `cover.steel`
`#1e2a44` 로 어두웠다. 둘 다 **「아직 그림이 없다」**인데 밝기가 정반대라, 기다림이 두 밝기로
갈려 화면이 무거웠다. 한 밝기로 접는다.

## 깨지는 것

`ConcertCard` · `ConcertCardSkeleton` · native `ConcertCard` 에서 **`tone` 이 사라진다.**
공유 계약(`ConcertCardBareProps`)에서도 빠지므로 두 레인이 같이 움직인다.

```diff
- <ConcertCard.Framed tone={coverToneFor(event.id)} initial="ㅅ" … />
+ <ConcertCard.Framed initial="ㅅ" … />

- <ConcertCardSkeleton.CoverLarge tone="plum" />
+ <ConcertCardSkeleton.CoverLarge />
```

`CoverBlock` 의 `tone` 은 **optional 이 되고 기본이 `note`** 다 — 지향점이 그쪽이라 기본값이
그쪽이다. 값은 `Skeleton` 이 읽는 `color.surfaceHover` 와 같은 소스다.

## 남는 것

**팔레트 6톤과 `coverToneFor` 는 그대로 산다.** 편집 표지(`ArticleCard`·`LeadFeature`)가
그걸로 사는 자리이고, 거긴 로딩 면이 아니라 색 다양성이 곧 편집 디자인이다. 걷어낸 건
**공연 카드의 면 축**뿐이다.

## 같이 바뀐 것

- **면이 글자색도 정한다.** 어두운 6톤 위에선 종이, `note` 위에선 잉크를 `currentColor` 로
  흘린다. 커버 안 대형 이니셜이 톤을 한 번 더 받지 않아도 면을 따라 뒤집힌다.
  이니셜 투명도는 두 섀시가 한 값을 쓴다 — 예전엔 `framed` 만 흰색 85% 라, 면이 밝아지면
  그 값이 잉크 85% 가 되어 워터마크가 아니라 드롭캡이 된다.
- **`cover` 슬롯이 「포스터 층」으로 좁아진다.** 바닥(`note` 면 + 이니셜)은 언제나 카드가
  그리고, 슬롯은 그 위를 덮는다. 덮을 게 없으면 바닥이 드러난다 — 그래서 `cover` 와
  `initial` 을 **같이** 준다(0.31.0 의 배타 유니온은 풀린다). 활자를 패키지 밖으로 내보내지
  않고도 로드 실패 폴백이 제자리를 찾는다.

```tsx
<ConcertCard.Framed
  initial={title.charAt(0)}
  cover={<PosterImage src={url} />}  // 실패하면 아무것도 안 그린다 → 바닥이 드러남
  title={title}
  meta={meta}
/>
```
