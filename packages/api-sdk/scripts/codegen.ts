import { execSync } from 'node:child_process'

/**
 * `openapi.json` → `src/types/api.gen.ts`.
 *
 * 입력(`openapi.json`)은 이 패키지에 커밋되어 있다 — 서버에서 받아오지 않는다.
 * 스펙을 갱신하려면 billets-server 의 `/openapi.json`(dev 전용) 을 떠서 이 파일을 덮어쓴 뒤
 * 이 스크립트를 돌린다. 그래야 생성물과 입력이 같은 커밋에 남아 diff 가 설명된다.
 *
 * 산출물은 `.gen.ts` 라 루트 `biome.json` 이 건너뛴다(생성 파일 제외 규칙). 포맷 단계가 없다.
 */
function codegen() {
  execSync('npx openapi-typescript ./openapi.json -o src/types/api.gen.ts --alphabetize', {
    stdio: 'inherit',
  })
}

codegen()
