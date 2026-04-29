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
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
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
