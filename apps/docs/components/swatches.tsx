import {
  cover,
  fontSize,
  fontWeight,
  lineHeight,
  paper,
  radius,
  spacing,
  tokens,
  tokenVarName,
} from '@coldsurfers/design-system/tokens'

type Group =
  | 'color'
  | 'cover'
  | 'paper'
  | 'spacing'
  | 'radius'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'

const SCALES: Record<Group, Record<string, string>> = {
  color: tokens.color.semantic.light,
  cover,
  paper,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
}

/**
 * 토큰 표 — **값을 문서에 옮겨 적지 않는다.** `@coldsurfers/design-system/tokens` 에서 읽는다.
 *
 * 옮겨 적으면 토큰이 바뀔 때 문서가 조용히 거짓말을 시작한다. 이 표는 틀릴 수가 없다.
 */
export function Swatches({ group }: { group: Group }) {
  const scale = SCALES[group]
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

function Sample({ group, value }: { group: Group; value: string }) {
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

function sampleStyle(group: Group, value: string) {
  if (group === 'fontSize') return { fontSize: value }
  if (group === 'fontWeight') return { fontWeight: value }
  if (group === 'lineHeight') return { lineHeight: value }
  return undefined
}
