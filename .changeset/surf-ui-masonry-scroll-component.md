---
"@coldsurfers/surf-ui": minor
---

native `Masonry` 에 `renderScrollComponent` · `keyboardShouldPersistTaps` 를 연다. 바텀시트 안에서도 쓸 수 있다 — `@gorhom/bottom-sheet` 5.2 면 `renderScrollComponent={useBottomSheetScrollableCreator()}` 로 시트의 스크롤을 준다. 검색어 키보드가 떠 있을 때 항목 누름이 먹게 하려면 `keyboardShouldPersistTaps="handled"`.
