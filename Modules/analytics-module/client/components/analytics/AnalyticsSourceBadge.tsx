import { useTranslation } from 'react-i18next'

type AnalyticsSource = 'native' | 'wp-statistics' | string | undefined

export function AnalyticsSourceBadge({ source }: { source?: AnalyticsSource }) {
  const { t } = useTranslation()
  if (source !== 'wp-statistics') {
    return null
  }
  return (
    <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
      {t('analytics.source.wpStatistics')}
    </span>
  )
}
