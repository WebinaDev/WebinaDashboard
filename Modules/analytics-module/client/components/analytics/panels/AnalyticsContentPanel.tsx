import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsKpiGrid } from '@module-analytics/components/analytics/AnalyticsKpiGrid'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type ContentData = {
  products_created: number
  products_updated: number
  posts_published: number
  ai_products_done: number
  ai_blog_done: number
  ai_pages_done: number
  source?: string
}

export function AnalyticsContentPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'content', from, to],
    queryFn: () => apiFetch<ContentData>(`analytics/content?from=${from}&to=${to}`),
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
      <AnalyticsPanelQueryGate query={q} variant="overview" skeletonRows={4} skeletonColumns={3}>
        <AnalyticsKpiGrid
          items={[
            { label: t('analytics.content.productsCreated'), value: formatNumber(d?.products_created ?? 0, i18n.language) },
            { label: t('analytics.content.productsUpdated'), value: formatNumber(d?.products_updated ?? 0, i18n.language) },
            { label: t('analytics.content.postsPublished'), value: formatNumber(d?.posts_published ?? 0, i18n.language) },
            { label: t('analytics.content.aiProducts'), value: formatNumber(d?.ai_products_done ?? 0, i18n.language) },
            { label: t('analytics.content.aiBlog'), value: formatNumber(d?.ai_blog_done ?? 0, i18n.language) },
            { label: t('analytics.content.aiPages'), value: formatNumber(d?.ai_pages_done ?? 0, i18n.language) },
          ]}
        />
      </AnalyticsPanelQueryGate>
    </div>
  )
}
