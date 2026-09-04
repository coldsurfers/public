# @coldsurfers/design-system-mcp

[COLDSURF 디자인 시스템 문서](https://design.coldsurf.io)를 에이전트가 직접 읽는 MCP 서버.

문서를 번들하지 않는다. 사이트가 이미 굽는 `llms.txt`(색인)와 `/llms/<경로>.txt`(본문)를
읽어올 뿐이라, **문서를 고치면 이 패키지를 다시 발행하지 않아도 그날부터 최신이다.**

## 설치

패키지가 GitHub Packages 에 있어 인증이 필요하다. `~/.npmrc` 에 한 번만 적는다:

```ini
@coldsurfers:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<read:packages 권한의 GitHub PAT>
```

### Claude Code

```bash
claude mcp add coldsurf-ds -- npx -y @coldsurfers/design-system-mcp
```

### Claude Desktop · Cursor

```json
{
  "mcpServers": {
    "coldsurf-ds": {
      "command": "npx",
      "args": ["-y", "@coldsurfers/design-system-mcp"]
    }
  }
}
```

## 툴

| 툴 | 하는 일 |
| --- | --- |
| `discover_docs` | 카테고리 구조와 문서 수. 먼저 부른다 |
| `list_docs` | 제목 · 경로 · 한 줄 설명. `category` 로 좁힌다 |
| `get_doc` | 본문 하나 — **예제 코드 · props 표 · 토큰 값이 들어 있다** |

`get_doc` 이 돌려주는 본문은 문서 사이트가 그리는 것과 같은 데이터다. 예제는
`examples/*.tsx` 원본, props 표는 `@coldsurfers/design-system` 소스 타입, 토큰 값은
발행된 토큰에서 나온다 — 사람이 옮겨 적은 값이 하나도 없다.

## 개발

```bash
pnpm build                       # dist/stdio.js
COLDSURF_DOCS_URL=http://localhost:3000 node dist/stdio.js
```

`COLDSURF_DOCS_URL` 은 로컬 문서 서버를 물릴 때만 쓴다. 기본값은 `https://design.coldsurf.io`.
