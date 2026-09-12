import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import type { ComponentType } from 'react'
import { NativeStage } from '@/components/native-stage'
import { readExampleSource } from '@/lib/example-source'

/**
 * native 레인의 라이브 미리보기 — `Preview` 와 **같은 약속**이다. `examples/native-*.tsx`
 * 파일 하나가 화면과 코드 블록 양쪽의 정본이고, 그 파일은 발행되는 `dist` 를 문다.
 *
 * `Preview` 를 그대로 못 쓰는 건 native 트리가 앉을 자리가 달라서다. 웹 미리보기는
 * `flex-wrap` 한 줄에 조각을 늘어놓으면 되지만, RN 컴포넌트는 폭이 있는 면 위에서만
 * 제 모양이 나오고 `TabBar` 는 프로바이더까지 필요하다 — 그 자리가 `NativeStage` 다.
 *
 * ## 브라우저에서 도는 원리와 그 한계
 *
 * `next.config.mjs` 의 `react-native` → `react-native-web` 별칭 덕에 **RN 용으로 쓴 코드를
 * 고치지 않고** 그린다. 그래서 여기 그려진다는 건 그 조합이 실제 소비처에서도 선다는 증거다.
 *
 * ⚠️ 다만 별칭 하나로 모든 표면이 오지는 않는다. `react-native-reanimated` 는 워클릿을
 * babel 플러그인이 변환하는데 이 앱은 turbopack 이라 그 플러그인이 돌지 않는다.
 * 그래서 `PullToRefresh` · `AnimatedTabBar` 는 여기 못 오고 코드 블록으로만 설명한다
 * (coldsurfers/public#119).
 */
export async function NativePreview({
  name,
  height,
}: {
  name: string
  /** 면이 화면 전체를 전제할 때(하단 고정 탭바 등) 준다. 없으면 내용만큼 높아진다. */
  height?: number
}) {
  const [mod, source] = await Promise.all([
    import(`../examples/${name}.tsx`) as Promise<{ default: ComponentType }>,
    readExampleSource(name),
  ])

  const Demo = mod.default

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-fd-border">
      <div className="bg-fd-muted/40 p-8" data-preview={name}>
        <NativeStage height={height}>
          <Demo />
        </NativeStage>
      </div>
      <DynamicCodeBlock
        lang="tsx"
        code={source}
        codeblock={{ className: 'rounded-none border-0 border-t border-fd-border' }}
      />
    </div>
  )
}
