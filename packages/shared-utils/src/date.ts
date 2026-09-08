import { addDays, format, getDay, isSameYear, parse, startOfDay } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

const timeZone = 'Asia/Seoul'

function isDifferentYear(date: Date, now: Date = new Date()) {
  return !isSameYear(date, now)
}

function parseEventDate(
  eventDate: Date,
  options?: {
    formatStyle: 'korean' | 'english'
  },
) {
  const zonedDate = toZonedTime(eventDate, timeZone)
  const minutes = zonedDate.getMinutes()
  if (options?.formatStyle === 'english') {
    const timeFormat = (() => {
      if (isDifferentYear(zonedDate)) {
        return 'MMM dd, yyyy, h:mm a'
      }
      return 'MMM dd, h:mm a'
    })()
    return format(zonedDate, timeFormat, { locale: enUS })
  }
  const timeFormat = (() => {
    if (isDifferentYear(zonedDate)) {
      return minutes === 0 ? 'EEEE a h시, yyyy년 MMMM d일' : 'EEEE a h시 m분, yyyy년 MMMM d일'
    }
    return minutes === 0 ? 'EEEE a h시, MMMM d일' : 'EEEE a h시 m분, MMMM d일'
  })()
  return format(zonedDate, timeFormat, { locale: ko })
}

function toUTCDayRangeFromYYYYMMDD({ yyyymmdd }: { yyyymmdd: string }) {
  if (!/^\d{8}$/.test(yyyymmdd)) {
    throw new Error('Invalid date format. Expected YYYYMMDD')
  }
  const kstStart = parse(yyyymmdd, 'yyyyMMdd', new Date())
  const kstEnd = addDays(kstStart, 1)
  // 2. KST → UTC 변환
  const utcStart = fromZonedTime(kstStart, timeZone)
  const utcEnd = fromZonedTime(kstEnd, timeZone)
  return [utcStart, utcEnd]
}

type UTCDayRange = {
  label: 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  utcStart: Date
  utcEnd: Date
}

/**
 * 기준 날짜(yyyymmdd)가 속한 주의
 * 금/토/일 KST 00:00 → UTC Date 반환
 *
 * yyyymmdd가 없으면 현재 시점 기준
 */
function getWeekendUTCStartDates(params?: { yyyymmdd?: string }): UTCDayRange[] {
  const baseDate = params?.yyyymmdd ? parse(params.yyyymmdd, 'yyyyMMdd', new Date()) : new Date()

  // JS 기준: Sun=0, Mon=1, ... Sat=6
  const baseDay = getDay(baseDate)

  // 해당 주의 금요일(5)까지의 offset
  const diffToFriday = (5 - baseDay + 7) % 7

  const kstFridayStart = startOfDay(addDays(baseDate, diffToFriday))
  const kstSaturdayStart = addDays(kstFridayStart, 1)
  const kstSundayStart = addDays(kstFridayStart, 2)
  const kstMondayStart = addDays(kstFridayStart, 3) // Sunday end

  return [
    {
      label: 'FRIDAY',
      utcStart: fromZonedTime(kstFridayStart, timeZone),
      utcEnd: fromZonedTime(kstSaturdayStart, timeZone),
    },
    {
      label: 'SATURDAY',
      utcStart: fromZonedTime(kstSaturdayStart, timeZone),
      utcEnd: fromZonedTime(kstSundayStart, timeZone),
    },
    {
      label: 'SUNDAY',
      utcStart: fromZonedTime(kstSundayStart, timeZone),
      utcEnd: fromZonedTime(kstMondayStart, timeZone),
    },
  ]
}

export const dateUtils = {
  parseEventDate,
  toUTCDayRangeFromYYYYMMDD,
  getWeekendUTCStartDates,
}
