import { style, styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import type { CoverSurfaceTone } from '../tokens'

/**
 * 카드 커버 블록 — 시안의 `지형(terrain)` 색면.
 *
 * 기존엔 Tailwind 가 `bg-cover-${tone}` 동적 클래스를 스캔하지 못해 리터럴 맵을 손으로 유지했다.
 * **VE 에서는 그 제약 자체가 사라진다** — `styleVariants` 가 키를 순회해 클래스를 생성하므로
 * 스캐너에 보일 필요가 없다. 드리프트 가드는 `Record<CoverTone, …>` 타입이 계속 맡는다.
 */
export const coverBlock = style(
  inComponentsLayer({
    position: 'relative',
    overflow: 'hidden',
  }),
)

/**
 * 커버 색면이 아닌 표면(예: `DemoCard` 아바타 원)도 같은 팔레트를 쓰므로 따로 export.
 *
 * `note` 는 팔레트가 아니라 **기다림의 면**이다(`CoverSurfaceTone`). 값을 `Skeleton` 과 같은
 * `vars.color.surfaceHover` 에서 읽는다 — API 대기와 이미지 대기가 한 밝기여야 한다.
 */
export const coverTone: Record<CoverSurfaceTone, string> = styleVariants({
  forest: inComponentsLayer({ background: vars.cover.forest }),
  wine: inComponentsLayer({ background: vars.cover.wine }),
  navy: inComponentsLayer({ background: vars.cover.navy }),
  moss: inComponentsLayer({ background: vars.cover.moss }),
  steel: inComponentsLayer({ background: vars.cover.steel }),
  plum: inComponentsLayer({ background: vars.cover.plum }),
  note: inComponentsLayer({ background: vars.color.surfaceHover }),
})

/**
 * 면 위에 서는 것들의 **기준 색** — `currentColor` 로 흘린다.
 *
 * 색면 6톤은 어두우니 종이, `note` 는 밝으니 잉크. 이걸 면이 정해 주지 않으면 커버 안에 서는
 * 것(대형 이니셜)이 톤을 **한 번 더** 받아야 하고, 그 순간 면과 글자가 따로 갈릴 수 있다.
 *
 * ⚠️ 커버 안의 **글자 대부분은 자기 색을 직접 쓴다**(제목·메타·스탬프·eyebrow). 여기 기준색을
 * 물리는 건 색을 안 정한 것들뿐이라 기존 표면은 안 움직인다.
 */
export const coverForeground: Record<CoverSurfaceTone, string> = styleVariants({
  forest: inComponentsLayer({ color: vars.paper.warm }),
  wine: inComponentsLayer({ color: vars.paper.warm }),
  navy: inComponentsLayer({ color: vars.paper.warm }),
  moss: inComponentsLayer({ color: vars.paper.warm }),
  steel: inComponentsLayer({ color: vars.paper.warm }),
  plum: inComponentsLayer({ color: vars.paper.warm }),
  note: inComponentsLayer({ color: vars.ink.base }),
})
