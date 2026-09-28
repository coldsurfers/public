---
"@coldsurfers/design-system": minor
---

동네 표면(paul-rockstar#506) 시안에 맞춰 프리미티브 넷을 넓힌다.

- `Button` — `shape="pill"`(알약 모서리) · `leadingIcon`(라벨 앞 아이콘) 추가. 웹도 `disabled` 면 흐려지고(`opacity: 0.4`, native 와 같은 값 — `BUTTON_SPEC.disabledOpacity`) hover 가 걸리지 않는다
- `Toast` — `show(message, tone, { description, action })`. 둘째 줄이 있으면 두 줄 상자, 액션이 있으면 누를 수 있고 4초 선다(`TOAST_TIMING`)
- `Callout` — `icon` 슬롯(본문 첫 줄 옆)
- ⚠️ `Chip` — `active` 가 반전(ink 바탕)에서 **accent 바탕 + 흰 글자**로 바뀐다. API 는 그대로지만 모든 선택된 칩의 색이 바뀐다
