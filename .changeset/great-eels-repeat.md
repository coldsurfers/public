---
"@coldsurfers/markdown-renderer": patch
---

코드블록이 깨져 보이던 세 가지를 고친다.

- `pre` 오버라이드가 Shiki 의 인라인 `style`·`tabIndex` 를 버려서 코드 전체의 기본 전경색이 사라졌다. 이제 forward 한다 — `background-color` 만 걷어내고 블록 톤은 `--code-bg` 토큰(인라인 코드와 같은 톤)이 진다.
- Shiki 변환 뒤 블록 `<code>` 는 `language-*` 클래스를 잃어 인라인 코드로 오판됐다. 인라인 코드 칩(배경·패딩·`font-size`)이 블록 한가운데 그려지던 것을 부모 신호(`InsidePre`)로 판정하게 바꾼다.
- dual theme(`github-light` + `github-dark`, `defaultColor: 'dark'`)을 `github-light` 단일로 좁힌다. design-system 의 스킴은 light 하나뿐이라 다크 토큰 색이 warm-paper 위에 그대로 칠해지고 있었다. 토큰마다 굽던 `--shiki-*` 변수도 같이 사라진다.
