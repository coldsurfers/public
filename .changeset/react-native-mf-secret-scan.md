---
"@coldsurfers/react-native-mf": minor
---

`deploy` 가 올리기 전에 번들에서 비밀 값으로 보이는 문자열(AWS · PEM 개인 키 · GitHub · Slack · Stripe · Google · Anthropic · OpenAI)을 찾으면 멈춘다. 공개 값은 config `scan.allow` 로 통과시킨다.
