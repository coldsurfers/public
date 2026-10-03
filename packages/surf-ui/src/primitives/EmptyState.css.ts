import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 「아직 아무것도 없습니다」 자리의 세로 스택. 근거·결정 로그: coldsurfers/public#42
 *
 * ## 다섯 줄이 전부다 — 나머지는 전부 지면 몫
 *
 * web-next 실측 5벌(`Tonight`·`NearBy`·`ThisWeekend`·`NotificationsSurface`·`WorkSearch`)의
 * **조판이 이미 갈려 있다** — 제목이 `xl/strong/700` · `base/500/text` · `15px/text` 로 셋이고
 * 본문도 `muted`/`subtle` 로 둘이다. 그래서 `title`/`description` props 로 접지 않는다:
 * 접으면 정본을 하나 골라야 하고, **다섯 중 넷이 시각적으로 바뀐다**(#42 D-7).
 *
 * 조판을 `children` 에 맡기면 액션 슬롯도 필요 없어진다 — `NearBy` 는 CTA 자리에 링크가 아니라
 * *반경 넓히기 버튼 N개*가 들어가는데, `children` 이면 그냥 된다.
 *
 * ## 바깥 여백을 소유하지 않는다
 *
 * 실측 셋(80·64·24px)이 전부 space 스케일에 정확히 떨어져 호출부 sprinkles 한 줄로 내려간다.
 * `PageBanner`(#33)·`Callout`(#34)·`UnderlineTabs`(#39) 와 같은 규율이다 — 셸 치수는 지면이 안다.
 *
 * ## `gap` 하나만 컴포넌트가 든다 (#42 D-8)
 *
 * 스택 자신의 리듬이라 남긴다. 실측이 A 3벌 16px : B 2벌 8px 로 갈려 **다수(A)를 정본으로 골랐다** —
 * CTA 가 서는 클러스터라 여백이 좁으면 버튼이 문구에 붙는다. B 2벌은 8px → 16px 로 벌어진다.
 *
 * ## `textAlign` 을 왜 함께 드나
 *
 * `alignItems: center` 만으로는 **줄바꿈되는 문단이 왼쪽 정렬로 남는다**(`Tonight` 본문은
 * 모바일에서 실제로 두 줄이 된다). 둘은 한 벌이다.
 *
 * 좌측정렬이 필요한 소비처(`WorkSearch`)는 sprinkles 의 `textAlign` 축으로 뒤집는다 —
 * `ds-utilities` 라 이 레이어를 확실히 이긴다. 로컬 `.css.ts` 로 덮으면 같은 `ds-components`
 * 안에서 소스 순서가 승자를 정하게 된다(한 속성 한 레이어).
 */
export const emptyState = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: vars.space['4'],
  }),
)
