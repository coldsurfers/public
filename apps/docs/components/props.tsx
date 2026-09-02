import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createGenerator, type GenerateOptions } from 'fumadocs-typescript'
import { TypeTable } from 'fumadocs-ui/components/type-table'

/**
 * props 표 — **DS 소스의 타입에서 직접 뽑는다.** 문서에 옮겨 적지 않는다.
 *
 * `AutoTypeTable` 을 그대로 쓰지 않는 이유는 하나다: `extends ButtonHTMLAttributes<…>` 를
 * 펼쳐 `aria-*` 까지 300줄을 쏟는다. 읽는 사람이 알고 싶은 건 **이 컴포넌트가 연 축**이지
 * React 가 통과시키는 DOM 속성 전부가 아니다.
 *
 * 그래서 소스의 `interface` 블록에서 *자기 멤버 이름* 을 읽어 그 교집합만 남긴다.
 * 상속 축은 표 대신 한 줄 각주로 밝힌다 — 없다고 거짓말하지는 않는다.
 */
const generator = createGenerator()

/**
 * 별칭 union 을 **값까지 펼친다.** `variant?: ButtonVariant` 만 보여주면 읽는 사람이
 * 무엇을 넣을 수 있는지 모른다 — 표의 존재 이유가 거기 있다. 리터럴로만 이뤄진 union 만
 * 펼치고(`boolean` 이 `false | true` 로 망가지는 걸 막는다), 원래 별칭 이름은 툴팁에 남긴다.
 */
const SIMPLIFY: NonNullable<GenerateOptions['typeSimplifier']> = {
  shouldSimplify: () => true,
  override: ({ type }) => {
    if (!type.isUnion()) return undefined
    const parts = type.getUnionTypes().filter((part) => !part.isUndefined() && !part.isNull())
    if (parts.length === 0 || parts.some((part) => !part.isStringLiteral())) return undefined
    // ts-morph 는 큰따옴표로 뱉는다 — 레포 코드 스타일(작은따옴표)에 맞춘다.
    return parts.map((part) => part.getText().replace(/"/g, "'")).join(' | ')
  },
}

const SRC = path.join(process.cwd(), '..', '..', 'packages', 'design-system', 'src')

export interface PropsTableProps {
  /** 컴포넌트 이름. `Button` → `primitives/Button.tsx` 의 `ButtonProps`. */
  of: string
  /** `src/` 아래 디렉터리. */
  dir?: string
  /** 파일 이름이 컴포넌트 이름과 다를 때. */
  file?: string
  /** 타입 이름이 `${of}Props` 가 아닐 때. */
  name?: string
  /**
   * 보여줄 prop 이름을 직접 준다 — 쉼표로 구분.
   *
   * 타입이 `export interface` 가 아니라 **union 별칭**이면(`ChipProps`) 소스에서 자기 멤버를
   * 읽어낼 수가 없어 DOM 속성까지 쏟아진다. 그 한 자리를 위한 탈출구다.
   */
  only?: string
}

export async function Props({ of, dir = 'primitives', file, name, only }: PropsTableProps) {
  const typeName = name ?? `${of}Props`
  const filePath = path.join(SRC, dir, file ?? `${of}.tsx`)

  const [docs, source] = await Promise.all([
    generator.generateTypeTable({ path: filePath, name: typeName }, { typeSimplifier: SIMPLIFY }),
    fs.readFile(filePath, 'utf8'),
  ])

  const doc = docs[0]
  if (!doc) return null

  const own = only ? only.split(',').map((part) => part.trim()) : ownMembers(source, typeName)
  const entries = own
    ? doc.entries
        .filter((entry) => own.includes(entry.name))
        .sort((a, b) => own.indexOf(a.name) - own.indexOf(b.name))
    : doc.entries

  const inherited = inheritedFrom(source, typeName)

  return (
    <>
      <TypeTable
        type={Object.fromEntries(
          entries.map((entry) => [
            entry.name,
            {
              type: displayType(entry),
              typeDescription: expanded(entry) ? entry.type : undefined,
              description: entry.description || undefined,
              default: entry.tags.find((tag) => tag.name === 'defaultValue')?.text,
              required: entry.required,
              deprecated: entry.deprecated,
            },
          ]),
        )}
      />
      {inherited ? (
        <p className="text-sm text-fd-muted-foreground">
          그 밖의 <code>{inherited}</code> 속성은 루트 엘리먼트로 그대로 통과한다.
        </p>
      ) : null}
    </>
  )
}

/** 별칭이 값으로 펼쳐졌는가. 펼쳐졌을 때만 원래 이름을 툴팁에 남긴다. */
function expanded(entry: { type: string; simplifiedType: string }): boolean {
  return entry.simplifiedType.includes("'") && entry.simplifiedType !== entry.type
}

/** 표에 적을 타입. `?` 가 이미 선택을 말하므로 ` | undefined` 는 지운다. */
function displayType(entry: { type: string; simplifiedType: string }): string {
  return expanded(entry) ? entry.simplifiedType : entry.type.replace(/\s*\|\s*undefined$/, '')
}

/** `export interface X … { … }` 의 최상위 프로퍼티 이름 — 선언 순서대로. */
function ownMembers(source: string, name: string): string[] | null {
  const head = source.indexOf(`export interface ${name}`)
  if (head === -1) return null

  const open = source.indexOf('{', head)
  if (open === -1) return null

  let depth = 0
  let close = open
  for (; close < source.length; close++) {
    if (source[close] === '{') depth++
    else if (source[close] === '}' && --depth === 0) break
  }

  const body = source.slice(open + 1, close)
  const names: string[] = []
  // 중첩 블록(함수 시그니처 등)을 지운 뒤 최상위 `name?:` 만 읽는다.
  for (const line of body.replace(/\{[^{}]*\}/g, '{}').split('\n')) {
    const match = /^\s{2}(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/.exec(line)
    if (match) names.push(match[1])
  }

  return names.length > 0 ? names : null
}

/** `extends A, B` 절을 사람이 읽을 문장 조각으로. */
function inheritedFrom(source: string, name: string): string | null {
  const match = new RegExp(`export interface ${name}\\s+extends\\s+([^{]+)\\{`).exec(source)
  return match ? match[1].trim().replace(/,\s*/g, ', ') : null
}
