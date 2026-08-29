/**
 * `@coldsurfers/markdown-renderer` — 마크다운 한 덩이를 COLDSURF 산문 표면으로 그린다.
 *
 * 코드블록 하이라이팅(shiki)·미디어 임베드(YouTube·Bandcamp·OG 카드·coldsurf.io 이벤트)·
 * 이미지 라이트박스까지가 한 컴포넌트 안이다. 색·간격은 DS 계약(`vars`)을 그대로 쓰므로
 * 소비자는 DS 의 `styles.css` 와 이 패키지의 `styles.css` 를 **둘 다** 물어야 한다.
 *
 * 임베드 데이터는 렌더 시점에 네트워크로 가져오지 않는다 — 소비처가 빌드타임에 해소해
 * `bandcampEmbeds`·`ogCards`·`coldsurfEvents` prop 으로 밀어 넣는다.
 */
export {
  type BandcampEmbedData,
  type ColdsurfEventData,
  type ColdsurfTicket,
  KOPIS_COPYRIGHT_TEXT,
  MarkdownRenderer,
  type OgCardData,
} from './markdown-renderer'
