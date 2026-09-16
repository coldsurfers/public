---
'@coldsurfers/react-native-mf': patch
---

- `./cli` 를 **import 만 해도** `process.exitCode` 가 1 이 되고 stdout 에 usage 가 찍히던 것을
  고친다. 이 모듈은 bin 이면서 동시에 `exports` 맵의 진입점이라, 최상단 실행이 `run` 을
  가져다 쓰려던 프로세스를 실패로 끝냈다. bin 으로 불렸을 때만 실행한다.
- README 의 회수 예제가 틀렸다. 등록되는 값은 **모듈 네임스페이스**라 `export default` 를 쓴
  미니앱은 `.default` 로 한 겹 더 들어가야 한다 — 코드·주석·테스트는 맞았고 README 만 어긋나 있었다.
- 전역 레코드를 지연 생성하는 같은 12줄이 `registry` 와 `shared-scope` 에 두 벌 있었고 존재
  판정이 갈려 있었다(`in` ↔ `!== undefined`). 식을 한 곳으로 모으고 판정을 맞춘다.
