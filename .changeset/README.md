# Changesets

패키지를 만진 PR 은 `pnpm changeset` 으로 변경 기록을 남긴다. main 에 머지되면
Release 워크플로가 "chore: version packages" PR 을 열고, 그 PR 이 머지되면 npm 에 발행된다.

상세: https://github.com/changesets/changesets
