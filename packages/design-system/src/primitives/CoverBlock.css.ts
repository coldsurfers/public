import { style, styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import type { CoverTone } from '../tokens'

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

/** 커버 색면이 아닌 표면(예: `DemoCard` 아바타 원)도 같은 팔레트를 쓰므로 따로 export. */
export const coverTone: Record<CoverTone, string> = styleVariants({
  forest: inComponentsLayer({ background: vars.cover.forest }),
  wine: inComponentsLayer({ background: vars.cover.wine }),
  navy: inComponentsLayer({ background: vars.cover.navy }),
  moss: inComponentsLayer({ background: vars.cover.moss }),
  steel: inComponentsLayer({ background: vars.cover.steel }),
  plum: inComponentsLayer({ background: vars.cover.plum }),
})
