import { promises as fs } from 'node:fs'
import path from 'node:path'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import type { ComponentType } from 'react'

/**
 * 라이브 미리보기 — **`examples/*.tsx` 파일 하나가 화면과 코드 양쪽의 정본**이다.
 *
 * 렌더링은 그 파일을 실제로 import 해서 하고, 코드 블록은 같은 파일을 읽어서 보여준다.
 * 그래서 문서에 적힌 코드와 화면에 보이는 것이 어긋날 수 없다 — 어긋나려면 파일이 둘이어야 한다.
 *
 * 그 컴포넌트는 `@coldsurfers/design-system` 을 워크스페이스로 물지만, exports 맵이 가리키는
 * 곳은 `dist` 다. 즉 **이 사이트가 빌드되는 것 자체가 발행 계약의 첫 소비자 검증**이다 —
 * `exports` 에 없는 경로는 여기서도 안 열린다.
 */
export async function Preview({ name, padded = true }: { name: string; padded?: boolean }) {
  const [mod, source] = await Promise.all([
    import(`../examples/${name}.tsx`) as Promise<{ default: ComponentType }>,
    fs.readFile(path.join(process.cwd(), 'examples', `${name}.tsx`), 'utf8'),
  ])

  const Demo = mod.default

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-fd-border">
      <div
        className={`ds-surface flex flex-wrap items-center gap-4 ${padded ? 'p-8' : ''}`}
        data-preview={name}
      >
        <Demo />
      </div>
      <DynamicCodeBlock
        lang="tsx"
        code={stripDirectives(source)}
        codeblock={{ className: 'rounded-none border-0 border-t border-fd-border' }}
      />
    </div>
  )
}

/** `'use client'` 지시문은 예제의 본질이 아니라 Next 사정이다 — 코드 블록에서 지운다. */
function stripDirectives(source: string): string {
  return source.replace(/^'use client'\n+/, '').trimEnd()
}
