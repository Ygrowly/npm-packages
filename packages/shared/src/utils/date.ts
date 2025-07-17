import dayjs from 'dayjs'

export type TimeFormatTemp =
  | 'YYYY'
  | 'YYYY-MM'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'YYYY-MM-DD 00:00:00'
  | 'YYYY-MM-DD 23:59:59'
  | 'YYYY/MM/DD'

export function timeFormat(text: any, temp: TimeFormatTemp = 'YYYY-MM-DD HH:mm:ss') {
  return text ? dayjs(text).format(temp) : ''
}

export const dateFasts = {
  今日: {
    label: '今日',
    value() {
      return [dayjs().startOf('day').toDate().getTime(), dayjs().endOf('day').toDate().getTime()]
    }
  },
  昨日: {
    label: '昨日',
    value() {
      return [
        dayjs().subtract(1, 'day').startOf('day').toDate().getTime(),
        dayjs().subtract(1, 'day').endOf('day').toDate().getTime()
      ]
    }
  },
  本月: {
    label: '本月',
    value() {
      return [dayjs().startOf('month').toDate().getTime(), dayjs().endOf('day').toDate().getTime()]
    }
  },
  上月: {
    label: '上月',
    value() {
      return [
        dayjs().subtract(1, 'month').startOf('month').toDate().getTime(),
        dayjs().subtract(1, 'month').endOf('month').toDate().getTime()
      ]
    }
  },
  本季: {
    label: '本季',
    value() {
      const currentMonth = dayjs().month()
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3
      const quarterEndMonth = quarterStartMonth + 2
      return [
        dayjs().month(quarterStartMonth).startOf('month').toDate().getTime(),
        dayjs().month(quarterEndMonth).endOf('month').toDate().getTime()
      ]
    }
  },
  上季: {
    label: '上季',
    value() {
      const currentMonth = dayjs().month()
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3
      const prevQuarterStartMonth = quarterStartMonth - 3
      const prevQuarterEndMonth = quarterStartMonth - 1
      return [
        dayjs().month(prevQuarterStartMonth).startOf('month').toDate().getTime(),
        dayjs().month(prevQuarterEndMonth).endOf('month').toDate().getTime()
      ]
    }
  },
  本年: {
    label: '本年',
    value() {
      return [dayjs().startOf('year').toDate().getTime(), dayjs().endOf('day').toDate().getTime()]
    }
  },
  去年: {
    label: '去年',
    value() {
      return [
        dayjs().subtract(1, 'year').startOf('year').toDate().getTime(),
        dayjs().subtract(1, 'year').endOf('year').toDate().getTime()
      ]
    }
  }
}
