---
'@coldsurfers/data-models': patch
---

검색 DTO 의 artist `profileImgUrl` 을 nullable 로 교체. 프로필 이미지가 없는 아티스트(실측 93.8%)가 소비자의 행 단위 `safeParse` 에서 버려져 검색 결과에서 통째로 사라지던 문제.
