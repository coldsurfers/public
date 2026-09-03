/**
 * 토큰 값 → Tailwind v4 `@theme` 한 장(`dist/index.css`).
 *
 * **왜 별도 패키지인가:** `@theme` 매핑은 Tailwind 를 쓰는 소비자에게만 의미가 있다. DS 의
 * `exports` 에 올리면 안 쓰는 소비자도 그 계약을 지고, 나중에 빼는 게 major 다. 패키지를 가르면
 * 둘 다 사라진다 — 설치를 안 하면 0 바이트고, DS 의 공개 API 는 그대로다.
 * (근거·선례: `docs/p1-boundary.md` 결정 4)
 *
 * **왜 `.mjs` 인가:** 값의 정본은 이미 DS 안에 있고 여기는 이름만 바꿔 옮긴다. 그 한 장을 굽자고
 * TS 러너·번들러를 하나 더 들이지 않는다 — 발행된 `dist/tokens.js` 를 node 가 그대로 연다.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  breakpoints,
  cover,
  editorialType,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  paper,
  radius,
  spacing,
  tokens,
  tokenVarName,
} from '@coldsurfers/design-system/tokens'

const distDir = join(dirname(fileURLToPath(import.meta.url)), 'dist')

const banner = '/* AUTO-GENERATED from @coldsurfers/design-system/tokens — do not edit. */\n'

/** Tailwind 네임스페이스 + 키 → 값. 스케일은 런타임에 안 바뀌므로 리터럴을 직접 박는다. */
const scaleBlock = (namespace, scale) =>
  Object.entries(scale)
    .map(([key, value]) => `  --${namespace}-${key}: ${value};`)
    .join('\n')

/** 시맨틱 색 → `bg-bg` · `text-heading` … 런타임에 바뀔 수 있는 축이라 `var()` 간접. */
const themeColor = Object.keys(tokens.color.semantic.light)
  .map((key) => {
    const name = tokenVarName('color', key)
    return `  --color-${name}: var(--${name});`
  })
  .join('\n')

/**
 * 커버 6톤 → `bg-cover-forest` · `text-cover-plum`. 스킴 불변이지만 `var()` 로 참조만 한다 —
 * 값을 복사하면 `tokens.css` 와 두 벌이 되어 한쪽만 바뀔 수 있다.
 */
const themeCover = Object.keys(cover)
  .map((key) => `  --color-cover-${key}: var(--${tokenVarName('cover', key)});`)
  .join('\n')

/** warm paper → `bg-paper-warm`. cover 와 같은 이유로 var 참조. */
const themePaper = Object.keys(paper)
  .map((key) => `  --color-paper-${key}: var(--${tokenVarName('paper', key)});`)
  .join('\n')

const themeFontFamily = Object.keys(fontFamily)
  .map((key) => `  --font-${key}: var(--${tokenVarName('fontFamily', key)});`)
  .join('\n')

const themeBreakpoints = Object.entries(breakpoints)
  .map(([key, value]) => `  --breakpoint-${key}: ${value};`)
  .join('\n')

/**
 * ⚠️ 스케일만 `var()` 간접을 쓰지 않는다. 특히 `--font-weight-*` 는 Tailwind 네임스페이스와
 * raw 변수 이름이 **같아서** 간접으로 쓰면 자기 자신을 참조한다. raw 이름은 `tokens.css` 의
 * `:root` 에 그대로 살아 있으므로 값이 두 벌이 되는 것도 아니다.
 */
const themeScale = [
  scaleBlock('text', fontSize),
  scaleBlock('leading', lineHeight),
  scaleBlock('font-weight', fontWeight),
  scaleBlock('spacing', spacing),
  scaleBlock('radius', radius),
].join('\n\n')

/**
 * 에디토리얼 타이포 → `--text-{group}-{size}` (+ Tailwind `--text-*` 모디파이어).
 * `textTransform` 은 `--text-*` 네임스페이스로 표현할 수 없어 빠진다 — recipe 의 몫이다.
 */
const themeEditorial = Object.entries(editorialType)
  .flatMap(([group, sizes]) =>
    Object.entries(sizes).map(([size, style]) => {
      const name = `--text-${group}-${size}`
      const lines = [`  ${name}: ${style.fontSize};`]
      if (style.lineHeight) lines.push(`  ${name}--line-height: ${style.lineHeight};`)
      if (style.letterSpacing) lines.push(`  ${name}--letter-spacing: ${style.letterSpacing};`)
      return lines.join('\n')
    }),
  )
  .join('\n')

const css = `${banner}@theme {
${themeFontFamily}

${themeColor}

${themeCover}

${themePaper}

${themeBreakpoints}

${themeScale}

${themeEditorial}
}
`

mkdirSync(distDir, { recursive: true })
writeFileSync(join(distDir, 'index.css'), css)
console.log(`tailwind4-theme: wrote dist/index.css (${css.split('\n').length} lines)`)
