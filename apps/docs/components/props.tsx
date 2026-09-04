import { TypeTable } from 'fumadocs-ui/components/type-table'
import { collectProps, type PropsQuery } from '@/lib/props-source'

/**
 * props 표 — 데이터는 `lib/props-source.ts` 가 DS 소스 타입에서 뽑는다.
 * 여기는 그리기만 한다. 평문 사본(`lib/llm-text.ts`)이 같은 데이터를 마크다운 표로 낸다.
 */
export async function Props(query: PropsQuery) {
  const table = await collectProps(query)
  if (!table) return null

  return (
    <>
      <TypeTable
        type={Object.fromEntries(
          table.entries.map((entry) => [
            entry.name,
            {
              type: entry.type,
              typeDescription: entry.alias,
              description: entry.description,
              default: entry.defaultValue,
              required: entry.required,
              deprecated: entry.deprecated,
            },
          ]),
        )}
      />
      {table.inherited ? (
        <p className="text-sm text-fd-muted-foreground">
          그 밖의 <code>{table.inherited}</code> 속성은 루트 엘리먼트로 그대로 통과한다.
        </p>
      ) : null}
    </>
  )
}
