/**
 * 도시 slug → 한국어 표기.
 *
 * slug 는 URL 에 박혀 있어 못 바꾸고, 표기만 여기서 옮긴다. 모르는 값은 그대로 돌려준다.
 */
const getLocationCityUIName = (originalName: string) => {
  switch (originalName.toLowerCase()) {
    case 'seoul':
      return '서울'
    case 'incheon':
      return '인천'
    case 'yeongjongdo':
      return '영종도'
    case 'ulsan':
      return '울산'
    case 'busan':
      return '부산'
    case 'daegu':
      return '대구'
    case 'jeju':
      return '제주'
    case 'gyeongsangbuk-do':
      return '경상북도'
    case 'gyeongsangnam-do':
      return '경상남도'
    case 'daejeon':
      return '대전'
    case 'sejong-city':
      return '세종시'
    case 'gyeonggi-do':
      return '경기도'
    case 'gangwon-do':
      return '강원도'
    case 'chungcheongbuk-do':
      return '충청북도'
    case 'chungcheongnam-do':
      return '충청남도'
    case 'jeollabuk-do':
      return '전라북도'
    // 「전남광주통합특별시 설치를 위한 특별법」(시행 2026-08-20)으로 광주광역시가 전라남도와
    // 한 광역이 됐다. `gwangju` 는 여기로 합쳤다 — slug 는 URL 이라 그대로 둔다.
    case 'jeollanam-do':
      return '전남·광주'
    case 'tokyo':
      return '도쿄'
    case 'osaka':
      return '오사카'
    case 'hochiminh':
      return '호치민'
    case 'chiba':
      return '치바'
    default:
      return originalName
  }
}

export const locationCityUtils = {
  getLocationCityUIName,
}
