import { execSync } from 'node:child_process'

/**
 * `openapi.json` → `src/types/api.gen.ts` · `legacy-openapi.json` → `src/types/legacy.gen.ts`.
 *
 * 입력 둘 다 이 패키지에 커밋되어 있다 — 서버에서 받아오지 않는다. 그래야 생성물과
 * 입력이 같은 커밋에 남아 diff 가 설명된다.
 *
 * - `openapi.json` — **정본**. billets-server(Hono on Workers, `api.coldsurf.io`) 의 계약.
 *   갱신: `pnpm --filter billets-server openapi:dump > packages/api-sdk/openapi.json`
 * - `legacy-openapi.json` — Hono 로 안 옮겨진 **잔여 계약**(Fastify on Lambda,
 *   `api.billets.coldsurf.io`). auth 6 · `/v1/ticket/` · `/v2/events/upload-tokens`.
 *   소비처(billets-app · coldsurf-studio)가 옮겨가면 이 파일은 줄다가 사라진다.
 *   손으로 줄이는 파일이지 재생성 대상이 아니다.
 *
 * 산출물은 `.gen.ts` 라 루트 `biome.json` 이 건너뛴다(생성 파일 제외 규칙).
 */
function codegen() {
  execSync('npx openapi-typescript ./openapi.json -o src/types/api.gen.ts --alphabetize', {
    stdio: 'inherit',
  })
  execSync(
    'npx openapi-typescript ./legacy-openapi.json -o src/types/legacy.gen.ts --alphabetize',
    { stdio: 'inherit' },
  )
}

codegen()
