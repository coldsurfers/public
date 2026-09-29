---
"@coldsurfers/design-system": patch
---

`Field` — 라이트 표면의 포커스 테두리를 `color.text` 1px 에서 **accent 1.5px** 로 바꾼다(paul-rockstar#515 파트너 등록 시안). 셸 크기는 그대로다 — 1px 테두리에 안쪽 그림자 0.5px 를 더한다. native `TextInput` 은 이미 포커스가 accent 라 두 레인이 맞춰진다.

- ⚠️ API 는 그대로지만 라이트 `Field` 를 쓰는 모든 자리의 포커스 색이 바뀐다
