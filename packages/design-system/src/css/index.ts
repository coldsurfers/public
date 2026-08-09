/**
 * `.css.ts` 자리 — contract · theme · reset · layers · sprinkles.
 *
 * 아직 비어 있다 — 채우는 건 coldsurfers/paul-rockstar#220 의 P2(병합).
 *
 * ⚠️ `sprinkles` 를 배럴에 재수출할지는 P2 결정이다. `.css.ts` import 는 CSS 부수효과라
 *    tree-shaking 이 안 돼, 원본 레포에선 배럴에서 **의도적으로 빼** 놨다
 *    (`vars` 한 줄 쓰는 소비처가 유틸 표 21.5KB 를 물던 문제). 빌드가 CSS 를 한 파일로
 *    굽는 지금 구조에선 CSS 쪽 비용은 사라지고 JS 쪽만 남는다 — 다시 재야 한다.
 */
export {}
