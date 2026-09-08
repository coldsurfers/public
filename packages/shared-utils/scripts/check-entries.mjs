// `package.json` 의 `exports` 가 `src/*.ts` 와 어긋나면 실패한다.
//
// 이 패키지는 루트 배럴이 없고 `모듈 하나 = 파일 하나 = 진입점 하나` 로 굴러간다(`vite.config.ts`).
// 그래서 모듈을 하나 추가하고 `exports` 갱신을 잊으면, 빌드도 타입체크도 테스트도 전부 통과한
// 채로 **그 유틸만 조용히 발행에서 빠진다.** 소비자는 배포된 뒤에야 안다. 그 창을 여기서 닫는다.
//
// 방향이 한쪽이라는 점이 중요하다 — `exports` 가 선언이고 파일이 사실이다. 파일에 맞춰
// `exports` 를 고치는 것이지, 그 반대가 아니다.

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8'))

const modules = readdirSync(resolve(pkgDir, 'src'))
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
  .map((f) => f.slice(0, -3))
  .sort()

const declared = Object.keys(pkg.exports)
  .filter((p) => p.startsWith('./') && p !== './package.json')
  .map((p) => p.slice(2))
  .sort()

const missing = modules.filter((m) => !declared.includes(m))
const orphaned = declared.filter((m) => !modules.includes(m))

// 경로 오타는 진입점 이름이 맞아도 빌드를 엉뚱한 파일로 보낸다 — 모양까지 본다.
const malformed = declared.filter((m) => {
  const e = pkg.exports[`./${m}`]
  return e?.types !== `./dist/${m}.d.ts` || e?.default !== `./dist/${m}.js`
})

if (pkg.exports['.']) {
  console.error('✗ 루트 진입점(`.`)이 선언돼 있습니다. 이 패키지는 배럴을 두지 않습니다.')
  console.error('  이유는 `vite.config.ts` 상단 주석에 있습니다.')
  process.exit(1)
}

if (missing.length || orphaned.length || malformed.length) {
  console.error('✗ package.json 의 exports 가 src/ 와 어긋납니다.\n')
  for (const m of missing) {
    console.error(`  누락  src/${m}.ts 는 있는데 "./${m}" 진입점이 없습니다 (발행에서 빠집니다)`)
  }
  for (const m of orphaned) {
    console.error(`  고아  "./${m}" 진입점이 있는데 src/${m}.ts 가 없습니다`)
  }
  for (const m of malformed) {
    console.error(`  경로  "./${m}" 는 ./dist/${m}.{d.ts,js} 를 가리켜야 합니다`)
  }
  console.error('\n고치는 법 — exports 에 아래 모양으로 한 항목씩 (알파벳 순):')
  console.error('  "./<모듈>": { "types": "./dist/<모듈>.d.ts", "default": "./dist/<모듈>.js" }')
  process.exit(1)
}

console.log(`✓ 진입점 ${modules.length}개가 src/ 와 일치합니다`)
