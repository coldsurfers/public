---
'@coldsurfers/design-system': minor
---

`ConcertCard` 에 `cover` 슬롯을 연다 — 커버를 채우는 것을 소비처가 정할 수 있다.

로드 실패 폴백처럼 **상태가 필요한 커버**가 들어갈 자리가 없었다. `cards` 는 훅도 `'use client'`
도 없는 서버 안전 모듈이라 그 상태를 패키지 안에서 들 수 없다 — 들면 엔트리가 통째로 클라이언트
전용이 되고, `primitives` 배럴이 `Toast` 로 겪은 RSC 사고를 반복한다. 그래서 자리만 카드가 정하고
내용물은 소비처가 준다(`coverAction` 과 같은 규율).

같이 정리한 것: **「포스터가 있는가」를 읽는 자리를 하나로 모았다.** 세 섀시가 같은 질문에 다르게
답하고 있었다 — `framed` 는 `CoverImage` 밖에서 한 번 더 읽었고(`posterUrl ? null : initial`),
`bare` 는 바깥 삼항이 먼저 갈라서 `CoverImage` 의 빈 갈래가 죽은 코드였다. `CoverImage` 를
`CoverFill(src, fallback)` 로 바꿔 판정 주인을 하나로 뒀다(무상태 유지).

정확한 문(`ConcertCard.Framed`·`.Bare`·`.Cover*`)에선 커버 축이 **유니온**이다 — `cover` 를
주면 `posterUrl`·`initial` 이 타입에서 닫힌다. 합집합으로 두면 슬롯을 쓰는 소비처가 아무 데도
안 그려질 자모 한 글자를 여전히 지어내야 했다(이 파일이 `variant="cover"` 에 대해 고발하던
그 병). 덤으로 `cover` 와 `posterUrl` 을 같이 줬을 때 누가 이기는지 외울 일도 없어진다.

기존 `posterUrl`·`initial` 은 그대로 산다 — `cover` 를 안 주면 동작도 타입도 같다.

```tsx
// 그대로 (변화 없음)
<ConcertCard.CoverCompact tone={tone} posterUrl={url} title={…} meta={…} />

// 상태가 필요한 커버 — 소비처가 꽂는다
<ConcertCard.CoverCompact tone={tone} cover={<PosterImage src={url} />} title={…} meta={…} />
```

⚠️ `cover` 는 웹 `ConcertCardProps` 에만 있다. 공유 계약(`ConcertCardBareProps`)에 올리면 native
가 안 그리는 prop 이 하나 더 생긴다 — `initial`·`footer` 가 이미 앓은 「있는데 안 먹는 prop」이다.
