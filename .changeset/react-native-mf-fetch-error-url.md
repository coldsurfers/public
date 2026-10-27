---
"@coldsurfers/react-native-mf": patch
---

`scriptManager` 가 번들을 받다 `fetch` 자체가 거절되면, 응답이 실패했을 때와 같은 꼴(`"<이름>" 번들을 받지 못했다 (<원래 에러> <URL>)`)로 다시 던진다. 원래 에러는 `cause` 에 남는다. 예전엔 RN 의 `Network request failed` 한 줄만 올라와 어느 주소였는지 알 수 없었다.
