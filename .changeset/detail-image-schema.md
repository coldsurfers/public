---
'@coldsurfers/api-sdk': minor
---

`components['schemas']['DetailImageDTOSchema']` 가 생긴다.

이 DTO 는 서버 라우트가 직접 물지 않는다 — `EventDetailDTOSchema` 안에 중첩돼 있을 뿐이라 문서에
통째로 인라인되고 이름이 남지 않았다. 그런데 billets-app 은 상세 이미지 리스트 3곳에서 이 DTO 를
*타입으로 직접* 물어서, 이름이 없으면 그쪽이 컴파일되지 않는다.

서버(`paul-rockstar#381`)가 `openAPIRegistry.register()` 로 이름표를 남기게 했고 스펙을 다시 떴다.
**순수 추가 1건** — 스키마 90→91, 경로 110개와 기존 스키마는 한 글자도 바뀌지 않는다.
