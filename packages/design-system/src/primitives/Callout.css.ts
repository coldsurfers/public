import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 본문 흐름에 끼는 인라인 알림 상자. 근거·결정 로그: coldsurfers/public#34
 *
 * ## 틴트는 전경색에서 파생한다
 *
 * 배경 14% · 테두리 28% 를 **톤 전경 토큰에 `color-mix`** 로 먹인다. `statusSuccessBg` 같은
 * `XBg` 토큰을 조회하지 않는 이유는 셋이다 —
 *
 * 1. `rgba(31,122,58,0.14)` 는 `color-mix(statusSuccess 14%, transparent)` 와 **수치가 같다.**
 *    조회하나 마나 같은 색이 나온다.
 * 2. `accent` 엔 `XBg` 짝이 없다. 조회로 통일하려면 토큰을 늘려야 하는데, 늘린 이름은 빼는 게
 *    major 다.
 * 3. 테두리엔 `XBorder` 토큰이 아예 없다. 테두리를 그리는 한 mix 는 어차피 필요하고, 한
 *    컴포넌트 안에 색을 만드는 방식을 둘 두지 않는다.
 *
 * 결과적으로 **톤당 진실은 전경 토큰 하나**이고, 여기 남는 리터럴은 농도 상수 둘뿐이다.
 *
 * ## 글자색이 톤마다 성격이 다른 이유
 *
 * `accent` 만 중립(`color.body`)이고 status 3종은 자기 톤색이다. 실측 두 소비처가 원래 그랬고
 * (`/legal` 안내 = 중립 글자 · `/auth` 실패 = 빨간 글자) 그건 드리프트가 아니라 성격 차이다 —
 * `accent` 는 강조지 *상태*가 아니라 글자를 물들일 이유가 없고, `danger` 는 글자까지 빨개야
 * 실패로 읽힌다 (#34 D-4).
 */

/** 배경 틴트 농도. `statusXBg` 토큰들이 쓰는 값과 같다. */
const TINT = 14

/** 테두리 농도. 배경의 두 배 — 상자 경계가 틴트에 묻히지 않는 최소치. */
const EDGE = 28

const tone = (fg: string, ink: string) =>
  inComponentsLayer({
    backgroundColor: `color-mix(in srgb, ${fg} ${TINT}%, transparent)`,
    borderColor: `color-mix(in srgb, ${fg} ${EDGE}%, transparent)`,
    color: ink,
  })

export const callout = recipe({
  base: inComponentsLayer({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: `${vars.space['4']} ${vars.space['5']}`,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: vars.radius.xl,
    fontSize: vars.fontSize.sm,
  }),

  variants: {
    tone: {
      accent: tone(vars.color.accent, vars.color.body),
      success: tone(vars.color.statusSuccess, vars.color.statusSuccess),
      warning: tone(vars.color.statusWarning, vars.color.statusWarning),
      danger: tone(vars.color.statusDanger, vars.color.statusDanger),
    },
  },

  defaultVariants: { tone: 'accent' },
})

/** 본문 — 액션이 옆에 서도 긴 문장이 액션을 밀어내지 않게. */
export const calloutBody = style(inComponentsLayer({ minWidth: 0 }))

/** 액션 — 줄바꿈으로 눌리지 않는다. 좁아지면 `flex-wrap` 이 통째로 아래로 내린다. */
export const calloutAction = style(inComponentsLayer({ flexShrink: 0 }))
