import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { appName, gitConfig } from './shared'

/**
 * `brandMorph` 를 켠 레이아웃에서만 nav 타이틀이 view-transition 이름을 쥔다.
 *
 * 홈은 같은 이름을 `<h1>` 이 쥐고 있다(`app/(home)/page.tsx`). 홈 레이아웃까지 켜면
 * 한 문서에 이름이 둘이 되고, 그러면 브라우저가 전환을 통째로 건너뛴다.
 */
export function baseOptions({ brandMorph = false } = {}): BaseLayoutProps {
  return {
    nav: { title: brandMorph ? <span className="vt-brand">{appName}</span> : appName },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
