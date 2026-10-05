import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsKpiGrid } from '@module-analytics/components/analytics/AnalyticsKpiGrid'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type SupportData = {
  tickets_created: number
  staff_replies: number
  csat_avg: number | null
  csat_count: number
  frequent: Array<{ subject: string; cnt: number }>
  source?: string
}

export function AnalyticsSupportPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'support', from, to],
    queryFn: () => apiFetch<SupportData>(`analytics/support?from=${from}&to=${to}`),
    retry: false,
  })
  useQueryErrorToast(q)
  const d = q.data

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
        <AnalyticsSourceBadge source={d?.source} />
      </div>
      <AnalyticsPanelQueryGate query={q} variant="table" skeletonRows={6} skeletonColumns={2}>
        <div className="space-y-4">
          <AnalyticsKpiGrid
            items={[
              { label: t('analytics.support.tickets'), value: formatNumber(d?.tickets_created ?? 0, i18n.language) },
              { label: t('analytics.support.replies'), value: formatNumber(d?.staff_replies ?? 0, i18n.language) },
              {
                label: t('analytics.support.csat'),
                value: d?.csat_avg == null ? '—' : formatNumber(d.csat_avg, i18n.language),
              },
              { label: t('analytics.support.csatCount'), value: formatNumber(d?.csat_count ?? 0, i18n.language) },
            ]}
          />
          <p className="text-sm font-medium">{t('analytics.support.frequent')}</p>
          <AnalyticsDataTable
            columns={[
              { key: 'subject', label: t('analytics.col.subject') },
              { key: 'count', label: t('analytics.col.count') },
            ]}
            rows={(d?.frequent ?? []).map((r) => ({
              subject: r.subject,
              count: formatNumber(r.cnt, i18n.language),
            }))}
            empty={t('analytics.empty')}
          />
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
