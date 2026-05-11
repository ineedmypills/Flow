export const useFormat = () => {
  const { t } = useI18n()

  const formatViews = (views) => {
    const n = Number(views)
    if (isNaN(n)) return views
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' ' + t('units.million')
    if (n >= 1000) return (n / 1000).toFixed(1) + ' ' + t('units.thousand')
    return n
  }

  const timeAgo = (date) => {
    if (!date) return ''
    let dateObj: Date
    
    if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (typeof date === 'string') {
      let dateStr = date
      if (!date.includes('Z') && !date.includes('+')) {
        dateStr = date.replace(' ', 'T') + 'Z'
      }
      dateObj = new Date(dateStr)
    } else {
      dateObj = new Date(date)
    }

    if (isNaN(dateObj.getTime())) return date
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return t('common.years_ago', { count: Math.floor(interval) })
    interval = seconds / 2592000
    if (interval > 1) return t('common.months_ago', { count: Math.floor(interval) })
    interval = seconds / 86400
    if (interval > 1) return t('common.days_ago', { count: Math.floor(interval) })
    interval = seconds / 3600
    if (interval > 1) return t('common.hours_ago', { count: Math.floor(interval) })
    interval = seconds / 60
    if (interval > 1) return t('common.minutes_ago', { count: Math.floor(interval) })
    if (seconds < 10) return t('common.just_now')
    return t('common.seconds_ago', { count: Math.floor(seconds) })
  }

  return {
    formatViews,
    timeAgo
  }
}
