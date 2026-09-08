/**
 * 공연 카테고리 원본명 → 한국어 표기.
 *
 * 원본명은 데이터 계층의 식별자라 그대로 두고, 표기만 여기서 옮긴다. 모르는 값은 손대지 않고
 * 그대로 돌려준다 — 카테고리가 늘 때 화면에 빈칸이 뜨는 것보다 영문 원본이 보이는 편이 낫다.
 */
const getEventCategoryUIName = (originalName: string) => {
  switch (originalName) {
    case 'Gigs':
      return '콘서트'
    case 'Theatre':
      return '연극 / 뮤지컬'
    case 'Dance':
      return '무용'
    case 'Korean-Traditional':
      return '국악'
    case 'Classic':
      return '클래식'
    case 'Party':
      return '파티 / 오프라인'
    case 'Dj':
      return '디제잉'
    default:
      return originalName
  }
}

export const eventCategoryUtils = {
  getEventCategoryUIName,
}
