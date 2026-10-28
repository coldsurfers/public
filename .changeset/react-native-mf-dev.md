---
"@coldsurfers/react-native-mf": minor
---

`dev` 명령과 호스트용 `createDevResolver({ hostname, names })` 를 더한다. `dev` 는 `react-native-mf.config.*` 를 읽고 `http://<hostname>:8082/<name>/index.bundle.js` 에서 요청마다 미니앱을 구워 내준다. 굽기에 실패하면 오류를 500 `text/plain` 으로 보내고, `scriptManager` 는 실패 응답이 `text/plain` 이면 그 본문을 에러에 붙인다. `s3Storage` 는 `bucket` 이 비어 있어도 만들어지고, 읽거나 쓸 때 던진다.
