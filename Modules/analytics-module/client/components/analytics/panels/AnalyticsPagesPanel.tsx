import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { Input } from '@/components/ui/input'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type PagesData = {
  items: Array<{ post_id: number; uri: string; title: string; views: number }>
  total: number
  source?: 'native' | 'wp-statistics'
}

export function AnalyticsPagesPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period
  const [search, setSearch] = useState('')

  const q = useQuery({
    queryKey: ['analytics', 'pages', from, to, search],
    queryFn: () => {
      const p = new URLSearchParams({ from: String(from), to: String(to), per_page: '30' })
      if (search.trim()) p.set('search', search.trim())
      return apiFetch<PagesData>(`analytics/pages?${p.toString()}`)
    },
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
      <AnalyticsPanelQueryGate query={q} variant="table" skeletonRows={8} skeletonColumns={3}>
        <div className="space-y-4">
        <Input placeholder={t('analytics.searchPages')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <AnalyticsDataTable
          columns={[
            { key: 'title', label: t('analytics.col.page') },
            { key: 'uri', label: t('analytics.col.uri') },
            { key: 'views', label: t('analytics.col.views') },
          ]}
          rows={(q.data?.items ?? []).map((p) => ({
            title: p.title,
            uri: p.uri,
            views: formatNumber(p.views, i18n.language),
          }))}
          empty={t('analytics.empty')}
        />
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
