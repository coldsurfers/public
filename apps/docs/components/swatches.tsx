import { tokenVarName } from '@coldsurfers/design-system/tokens'
import { TOKEN_SCALES, type TokenGroup } from '@/lib/token-scales'

/**
 * 토큰 표 — 값은 `lib/token-scales.ts` 가 DS 토큰에서 읽는다. 여기는 그리기만 한다.
 * 평문 사본(`lib/llm-text.ts`)이 같은 스케일을 마크다운 표로 낸다.
 */
export function Swatches({ group }: { group: TokenGroup }) {
  const scale = TOKEN_SCALES[group]
  const isColor = group === 'color' || group === 'cover' || group === 'paper'

  return (
    <div className="not-prose my-6 grid gap-2 sm:grid-cols-2">
      {Object.entries(scale).map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-lg border border-fd-border p-3 text-sm"
        >
          {isColor ? (
            <span
              className="size-9 shrink-0 rounded-md border border-fd-border"
              style={{ background: value }}
            />
          ) : (
            <Sample group={group} value={value} />
          )}
          <span className="flex min-w-0 flex-col">
            <code className="truncate text-fd-foreground">--{tokenVarName(group, key)}</code>
            <span className="truncate text-fd-muted-foreground">{value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function Sample({ group, value }: { group: TokenGroup; value: string }) {
  if (group === 'spacing') {
    return (
      <span className="flex size-9 shrink-0 items-center">
        <span className="h-3 bg-fd-primary" style={{ width: value, minWidth: 1 }} />
      </span>
    )
  }
  if (group === 'radius') {
    return (
      <span
        className="size-9 shrink-0 border border-fd-border bg-fd-muted"
        style={{ borderRadius: value }}
      />
    )
  }
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center text-fd-foreground"
      style={sampleStyle(group, value)}
    >
      Ag
    </span>
  )
}

function sampleStyle(group: TokenGroup, value: string) {
  if (group === 'fontSize') return { fontSize: value }
  if (group === 'fontWeight') return { fontWeight: value }
  if (group === 'lineHeight') return { lineHeight: value }
  return undefined
}
