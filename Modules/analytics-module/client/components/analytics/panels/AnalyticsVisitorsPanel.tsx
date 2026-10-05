import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsKpiGrid } from '@module-analytics/components/analytics/AnalyticsKpiGrid'
import { AnalyticsLineChart } from '@module-analytics/components/analytics/AnalyticsLineChart'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'

type VisitorsData = {
  top_visitors: Array<{ visitor_hash: string; views: number; last_seen: string; country?: string }>
  online: Array<{ visitor_hash: string; last_seen: string; hits: number; country?: string }>
  series: Array<{ day: string; visitors: number; views: number }>
  source?: 'native' | 'wp-statistics'
}

function shortHash(hash: string): string {
  const h = String(hash || '')
  if (h.length <= 12) return h || '—'
  return h.slice(0, 12) + '…'
}

export function AnalyticsVisitorsPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'visitors', from, to],
    queryFn: () => apiFetch<VisitorsData>(`analytics/visitors?from=${from}&to=${to}`),
    refetchInterval: 60000,
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
        <AnalyticsSourceBadge source={q.data?.source} />
      </div>
      <AnalyticsPanelQueryGate query={q} variant="chart" skeletonRows={8} skeletonColumns={4}>
        <div className="space-y-4">
        <AnalyticsKpiGrid
          items={[
            { label: t('analytics.kpi.online'), value: formatNumber(d?.online?.length ?? 0, i18n.language) },
            { label: t('analytics.kpi.topVisitors'), value: formatNumber(d?.top_visitors?.length ?? 0, i18n.language) },
          ]}
        />
        <AnalyticsLineChart title={t('analytics.chartVisitors')} data={d?.series ?? []} dataKey="visitors" name={t('analytics.kpi.visitors')} />
        <AnalyticsDataTable
          columns={[
            { key: 'id', label: t('analytics.col.visitor') },
            { key: 'views', label: t('analytics.col.views') },
            { key: 'country', label: t('analytics.col.country') },
            { key: 'last', label: t('analytics.col.lastSeen') },
          ]}
          rows={(d?.top_visitors ?? []).map((v) => ({
            id: shortHash(v.visitor_hash),
            views: formatNumber(v.views, i18n.language),
            country: v.country || '—',
            last: formatDisplayDateTime(v.last_seen, i18n.language),
          }))}
          empty={t('analytics.empty')}
        />
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
