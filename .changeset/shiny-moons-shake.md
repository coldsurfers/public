---
'@coldsurfers/paper': minor
---

`paper init` 과 `dist/schema.json` 을 낸다.

설정 파일을 얻는 경로가 README 복붙 하나였다. `init` 이 설치된 스키마를 상대경로로 찾아
`$schema` 에 박고, 그 다음부터 에디터가 필드 이름과 `format` 이 받는 값을 안다 —
자동완성을 켜는 한 줄을 자동완성 없이 먼저 쳐야 하던 자리가 사라진다.

스키마의 열거와 기본값은 `src/config.ts` 에서 파생하고, 필드 이름은 `satisfies` 가 묶는다.
