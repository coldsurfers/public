import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 밑줄 탭 — 아래 괘선 위에 2px 밑줄이 겹쳐 앉는 줄. 근거·결정 로그: coldsurfers/public#39
 *
 * ## 이 축이 소유하는 건 네 가지뿐이다
 *
 * **밑줄 · 색 · 굵기 · `-1px` 겹침.** 여백(`padding`)과 `gap` 은 소비처가 준다 —
 * 실측 4벌의 아래 여백이 12·10·7px 에 하나는 `paddingTop` 구조이고, `gap` 은 4벌 4값
 * (28·22·20·20→26px)이다. 셸 치수는 지면이 안다는 규율(#33 `PageBanner` · #34 `Callout`)을
 * 여기서도 그대로 든다. 그래서 **네 소비처의 픽셀이 하나도 안 움직인다.**
 *
 * 반대로 4벌이 이미 **완전히 일치하던 것**이 여기 올라온다 — 비활성 `muted` + `:hover strong`,
 * 활성 밑줄 2px, 활성 굵기 700. 갈라져 있던 건 정본을 골라 접었다(#39 D-3: `accent` 밑줄 →
 * `strong` · idle 굵기 700 → 500 · 자간 0.2px 제거).
 *
 * ## `-1px` 이 왜 축인가
 *
 * 줄(`underlineTabs`)이 1px 괘선을 긋고 항목이 2px 밑줄을 그으면, 겹침 없이는 밑줄이 괘선
 * **아래로 1px 밀려 뜬다.** 실측 4벌 중 둘(`StageSearchOverlay`·`DailyIndex`)이 이걸 빠뜨려
 * 실제로 떠 있었다. 눈에 잘 안 띄면서 소비처마다 다시 틀리는 값이라 컴포넌트가 든다.
 */

/** 줄 — 괘선만. `gap`·정렬은 소비처(실측 4벌이 전부 다르다). */
export const underlineTabs = style(
  inComponentsLayer({
    display: 'flex',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: vars.color.border,
  }),
)

/**
 * ⚠️ 활성 굵기 `700` 은 리터럴이다 — `fontWeight` 토큰이 `semibold`(600)에서 끝난다.
 * 실측 4벌이 전부 700 이라 600 으로 접으면 네 지면이 다 얇아진다. 토큰을 늘리는 건
 * 이 축이 혼자 정할 일이 아니라 값만 남긴다.
 */
export const underlineTab = recipe({
  base: inComponentsLayer({
    // 줄의 1px 괘선 위로 올라타 밑줄이 뜨지 않게 한다.
    marginBottom: '-1px',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transitionProperty: 'color, border-color',
    transitionDuration: '150ms',
  }),

  variants: {
    active: {
      true: inComponentsLayer({
        borderBottomColor: vars.color.strong,
        color: vars.color.strong,
        fontWeight: 700,
      }),
      false: inComponentsLayer({
        borderBottomColor: 'transparent',
        color: vars.color.muted,
        fontWeight: vars.fontWeight.medium,
        ':hover': { color: vars.color.strong },
      }),
    },
  },

  defaultVariants: { active: false },
})
