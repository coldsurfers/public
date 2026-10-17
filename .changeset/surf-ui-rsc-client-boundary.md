---
"@coldsurfers/surf-ui": patch
---

서버 컴포넌트가 `primitives` · `layout` 을 import 해도 터지지 않게 한다. context · 훅을 쓰는 모듈(Modal · Popover · Sheet · Toast · surface-mode · Page 등)을 `'use client'` 청크로 따로 내고, Button · Chip 같은 순수 부품은 directive 없는 청크에 남긴다. 그 전에는 `primitives.js` 최상단의 `createContext` 가 react-server 에서 `createContext is not a function` 으로 터졌다.
