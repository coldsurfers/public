---
"@coldsurfers/react-native-mf": patch
---

`dev` 의 굽기가 실패하면 오류 전부가 기기 LogBox 에도 뜬다. 기기는 고칠 때까지 마지막 성공 코드로 돌고, 고친 뒤의 갱신이 그 사이 바뀐 모듈을 한 번에 싣는다.
