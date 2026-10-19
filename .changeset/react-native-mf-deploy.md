---
"@coldsurfers/react-native-mf": minor
---

미니앱 배포 `deploy` · `rollback` 명령과 `./deploy` 진입점(`defineConfig` · `s3Storage`)을 연다. 채널마다 `manifest.json` 한 장에 릴리스(`version` · `requires` · `enabled`)를 쌓는다. bin 을 `dist/bin.js` 로 떼어 `run` 이 공유 청크로 옮겨져도 실행되게 한다.
