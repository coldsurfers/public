/**
 * 원자 유틸 — **배럴이 아니라 별도 진입점**이다.
 *
 * `sprinkles()` 의 런타임 맵은 JS 38 kB(gzip 5.7 kB)다. 배럴에서 재수출하면 `vars` 한 줄
 * 쓰려고 `.` 을 연 소비처까지 그걸 물게 되므로(실측: `index.js` 3.2 → 41.2 kB) 여기서 연다.
 *
 * CSS 는 갈리지 않는다 — `cssCodeSplit: false` 라 유틸 표 32 kB 는 `styles.css` 한 장에
 * 무조건 실린다. 그건 이 파일이 아니라 그 설정이 지는 대가다(vite.config.ts 재검토 #1).
 *
 * 표 자체(무엇을 넣고 무엇을 뺐는지, 실측 근거)는 `./css/sprinkles.css.ts` 주석.
 */
export { type Sprinkles, sprinkles } from './css/sprinkles.css'
