---
'@coldsurfers/design-system-mcp': patch
---

`list_docs` 의 `category` 설명에서 카테고리를 나열하지 않는다.

`"foundations", "components", "patterns"` 를 예시로 적어 뒀는데 `native` 섹션이 생기면서 목록이
낡았다. 섹션이 늘 때마다 이 줄이 조용히 거짓말을 시작하므로, 정본인 `discover_docs` 를 가리키게 바꾼다.
