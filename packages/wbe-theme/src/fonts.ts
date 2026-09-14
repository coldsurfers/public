/**
 * 웹폰트 self-host. 부수효과 전용 모듈이라 `import '@coldsurfers/wbe-theme/fonts'` 한 줄로 끝난다.
 *
 * 서브셋을 **명시해서** 문다 — `@fontsource/noto-sans-kr/400.css` 는 키릴·베트남어까지 끌고 온다.
 * Archivo Black 은 마스트헤드 영문 전용이라 latin 만 있으면 되고, 한글은 body 가 받는다.
 *
 * 이 파일은 번들에 인라인되지 않는다(`vite.config.ts` 의 external). 소비처 번들러가
 * `@fontsource/*` 를 직접 해석해 폰트 파일을 자기 asset 파이프라인으로 가져간다.
 */
import '@fontsource/archivo-black/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/noto-sans-kr/latin-400.css'
import '@fontsource/noto-sans-kr/korean-400.css'
