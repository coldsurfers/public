import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { SurfLogo } from '@/components/surf-logo'
import { gitConfig } from './shared'

/**
 * 홈과 문서가 같은 nav 를 쓴다. 로고가 view-transition 이름을 쥐어 라우트를 건너도 제자리에 남는다.
 * 이름은 한 문서에 하나뿐이어야 해서 다른 곳에 `vt-brand` 를 두지 않는다.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="vt-brand inline-flex items-center gap-2">
          <SurfLogo className="text-lg" />
          <span className="text-xs font-medium text-fd-muted-foreground">by COLDSURF</span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
