/**
 * `coldsurf` 테마 CSS 한 장을 굽고, 정적 인쇄 CSS 를 `dist/css/` 로 옮긴다.
 *
 * **왜 `.mjs` 인가:** 값의 정본은 DS 안에 있고 여기는 이름만 바꿔 옮긴다. 그 한 장을 굽자고
 * TS 러너를 하나 더 들이지 않는다 — 선례는 `packages/tailwind4-theme/build.mjs`.
 *
 * **왜 `dist/contract.js` 를 읽는가:** 계약의 정본은 `src/tokens/contract.ts`(TS)라 node 가
 * 직접 못 연다. vite 가 먼저 굽고 이 스크립트가 그 산출물을 읽는다 — 그래서 `build` 는
 * `vite build && node build.mjs` 순서다. 목록을 여기 다시 적으면 이름이 두 벌이 된다.
 */
import { cpSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fontFamily, letterSpacing, paper, radius, tokens } from '@coldsurfers/design-system/tokens'
import { PRINT_VAR_NAMES } from './dist/contract.js'

const root = dirname(fileURLToPath(import.meta.url))
const cssOutDir = join(root, 'dist', 'css')

const light = tokens.color.semantic.light

/**
 * 인쇄에는 hover 가 없다. DS 는 `link` 를 잉크로 두고 `linkHover` 에서만 sweep 를 드러내는데,
 * 지면에서 본문과 같은 색인 링크는 링크로 읽히지 않는다 — 그래서 hover 쪽 값을 정지 상태로 쓴다.
 */
const PRINT_LINK = light.linkHover

/**
 * DS `fontWeight` 는 semibold(600)가 상한이라 인쇄 볼드를 파생할 데가 없다.
 * 지면의 위계는 크기가 아니라 굵기로 주는 축이어서 700 이 필요하다 — 여기서만 리터럴이다.
 * DS 에 `bold` 를 들일지는 열린 결정: coldsurfers/public#124
 */
const PRINT_WEIGHT_STRONG = '700'

/** 인용면. 지어낸 hex 대신 accent 를 지면 바탕에 섞어 만든다 — 새 색 이름이 늘지 않는다. */
const PRINT_TINT = `color-mix(in srgb, ${light.accent} 8%, #ffffff)`

const theme = {
  '--print-canvas': light.surface,
  '--print-surface': paper.warm,
  '--print-surface-2': light.surface2,
  '--print-tint': PRINT_TINT,

  '--print-border': light.border,
  '--print-border-soft': light.borderSoft,

  '--print-ink': light.text,
  '--print-ink-strong': light.strong,
  '--print-ink-body': light.body,
  '--print-ink-muted': light.muted,
  '--print-ink-subtle': light.subtle,

  '--print-accent': light.accent,
  '--print-link': PRINT_LINK,
  '--print-quote': light.blockquote,
  '--print-code-bg': light.codeBg,
  '--print-code-fg': light.codeFg,

  // 표지는 잉크로 채운 면이다. DS 의 `cover` scale 은 카드 커버의 *지형색* 이라 자리가 다르다 —
  // 여섯 중 하나를 임의로 고르는 대신, 이미 이 문서의 색인 잉크를 쓴다.
  '--print-cover': light.strong,
  '--print-cover-ink': paper.warm,
  // 어두운 면 위에서는 대비가 반대로 성립해 subtle 이 읽힌다(DS tokens.ts 의 단서).
  '--print-cover-ink-muted': light.subtle,

  '--print-radius': radius.md,

  '--print-font-sans': fontFamily.sans,
  '--print-font-mono': fontFamily.mono,
  '--print-track': letterSpacing.normal,
  '--print-track-tight': letterSpacing.tight,
  '--print-weight-strong': PRINT_WEIGHT_STRONG,
  '--print-weight-sub': tokens.fontWeight.semibold,
}

// 계약에 있는데 안 채워졌으면 여기서 죽는다. CSS 가 `var(--없는이름)` 으로 조용히 비는 대신
// 빌드가 깨지는 게 낫다 — 지면은 색이 안 나온 것을 사람이 열어보기 전엔 아무도 모른다.
const missing = PRINT_VAR_NAMES.filter((name) => theme[name] === undefined)
if (missing.length > 0) {
  throw new Error(`coldsurf 테마가 계약을 못 채웠다: ${missing.join(' · ')}`)
}

const extra = Object.keys(theme).filter((name) => !PRINT_VAR_NAMES.includes(name))
if (extra.length > 0) {
  throw new Error(`계약에 없는 변수를 채웠다: ${extra.join(' · ')}`)
}

mkdirSync(join(cssOutDir, 'themes'), { recursive: true })

const banner = '/* AUTO-GENERATED from @coldsurfers/design-system/tokens — do not edit. */\n'
const body = PRINT_VAR_NAMES.map((name) => `  ${name}: ${theme[name]};`).join('\n')
writeFileSync(join(cssOutDir, 'themes', 'coldsurf.css'), `${banner}:root {\n${body}\n}\n`, 'utf8')

// 정적 인쇄 CSS 는 굽지 않고 그대로 옮긴다. JS 문자열로 굽는 순간 하이라이팅도 포매터도
// 안 걸리는데, 그게 이 패키지를 만든 이유였다.
for (const file of readdirSync(join(root, 'src', 'css')).filter((f) => f.endsWith('.css'))) {
  cpSync(join(root, 'src', 'css', file), join(cssOutDir, file))
}

console.log(`paper: dist/css — 테마 1장 + 정적 ${readdirSync(join(root, 'src', 'css')).length}장`)
