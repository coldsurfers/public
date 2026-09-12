# @coldsurfers/design-system-mcp

## 0.1.1

### Patch Changes

- [#120](https://github.com/coldsurfers/public/pull/120) [`b55631d`](https://github.com/coldsurfers/public/commit/b55631d247ec3bc9b0a12a67379564d819b65429) Thanks [@yungblud](https://github.com/yungblud)! - `list_docs` 의 `category` 설명에서 카테고리를 나열하지 않는다.

  `"foundations", "components", "patterns"` 를 예시로 적어 뒀는데 `native` 섹션이 생기면서 목록이
  낡았다. 섹션이 늘 때마다 이 줄이 조용히 거짓말을 시작하므로, 정본인 `discover_docs` 를 가리키게 바꾼다.

## 0.1.0

### Minor Changes

- [#60](https://github.com/coldsurfers/public/pull/60) [`534aaea`](https://github.com/coldsurfers/public/commit/534aaea4663f05578ed9df485a950976ce6728ec) Thanks [@yungblud](https://github.com/yungblud)! - 문서 MCP 서버를 낸다 — `discover_docs` · `list_docs` · `get_doc` 셋으로 에이전트가 design.coldsurf.io 를 직접 읽는다. `@coldsurfers/docs-mcp` 를 대신한다.
