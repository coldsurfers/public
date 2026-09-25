---
'@coldsurfers/data-models': patch
---

`DailyEditionData` 가 소비자 쪽에서 `any` 로 풀리던 것을 고친다.

`z.infer` 에 맡긴 결과 발행본 `.d.ts` 가 `z.ZodPreprocess<…, unknown>` 을 그대로 적어 냈는데,
그 인터페이스의 **인자 수가 zod 버전마다 다르다** — 4.4.3 은 `<B>` 하나, 4.5.4 는 `<B, I>` 둘.
우리는 4.5.x 로 빌드하고 소비자는 4.4.x 를 물고 있어 그 줄이 TS2558 로 떨어졌고,
`skipLibCheck` 아래에서는 조용히 `any` 가 됐다(`DailyEditionData` · `DailyEditionFeedPayload['edition']` 둘 다).

`DailyEditionData` 를 손으로 적고(`DailyDigestEdition | DailyProseEdition`) 스키마 상수에
`z.ZodType<DailyEditionData, unknown>` 을 명시한다. 두 버전에서 인자 수가 같은 타입이라 그 틈이
안 생긴다. **런타임 스키마는 그대로**고 좁혀지는 건 타입 표면뿐이다.
