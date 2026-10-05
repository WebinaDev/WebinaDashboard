import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { translateEnum } from '@/lib/enumLabels'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import { utmDisplayLabel } from '@/lib/utmLabel'

type ReferralsData = {
  categories: Array<{ category: string; visits: number }>
  sources: Array<{ source: string; category: string; visits: number }>
  source?: 'native' | 'wp-statistics'
}

export function AnalyticsReferralsPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'referrals', from, to],
    queryFn: () => apiFetch<ReferralsData>(`analytics/referrals?from=${from}&to=${to}`),
    retry: false,
  })
  useQueryErrorToast(q)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AnalyticsPeriodFilter
          preset={period.preset}
          fromDate={period.fromDate}
          toDate={period.toDate}
          onPresetChange={period.setPreset}
          onFromChange={period.setFrom}
          onToChange={period.setTo}
        />
        <AnalyticsSourceBadge source={q.data?.source} />
      </div>
      <AnalyticsPanelQueryGate query={q} variant="table" skeletonRows={6} skeletonColumns={2}>
        <div className="space-y-4">
        <AnalyticsDataTable
          columns={[
            { key: 'category', label: t('analytics.col.category') },
            { key: 'visits', label: t('analytics.col.visits') },
          ]}
          rows={(q.data?.categories ?? []).map((c) => ({
            category: translateEnum(t, 'analytics.ref', c.category),
            visits: formatNumber(c.visits, i18n.language),
          }))}
          empty={t('analytics.empty')}
        />
        <AnalyticsDataTable
          columns={[
            { key: 'source', label: t('analytics.col.source') },
            { key: 'category', label: t('analytics.col.category') },
            { key: 'visits', label: t('analytics.col.visits') },
          ]}
          rows={(q.data?.sources ?? []).map((s) => ({
            source: utmDisplayLabel(s.source, t),
            category: translateEnum(t, 'analytics.ref', s.category),
            visits: formatNumber(s.visits, i18n.language),
          }))}
          empty={t('analytics.empty')}
        />
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
