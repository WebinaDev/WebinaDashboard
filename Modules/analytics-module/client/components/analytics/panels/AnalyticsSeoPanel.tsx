import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsKpiGrid } from '@module-analytics/components/analytics/AnalyticsKpiGrid'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { Card, CardContent } from '@/components/ui/card'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type SeoData = {
  keywords_in_use: number
  keywords_ai_month: number
  optimized_pages: number
  internal_links: number
  external_links: number
  noindex_share_pct: number
  gsc_connected?: boolean
  source?: string
}

export function AnalyticsSeoPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'seo', from, to],
    queryFn: () => apiFetch<SeoData>(`analytics/seo?from=${from}&to=${to}`),
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
        <div className="space-y-4">
          <AnalyticsKpiGrid
            items={[
              { label: t('analytics.seo.keywords'), value: formatNumber(d?.keywords_in_use ?? 0, i18n.language) },
              { label: t('analytics.seo.optimizedPages'), value: formatNumber(d?.optimized_pages ?? 0, i18n.language) },
              { label: t('analytics.seo.internalLinks'), value: formatNumber(d?.internal_links ?? 0, i18n.language) },
              { label: t('analytics.seo.externalLinks'), value: formatNumber(d?.external_links ?? 0, i18n.language) },
              {
                label: t('analytics.seo.noindexShare'),
                value: `${formatNumber(d?.noindex_share_pct ?? 0, i18n.language)}%`,
              },
            ]}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">{t('analytics.seo.gscMissing')}</p>
                <p className="mt-2 text-sm">{t('analytics.seo.rankPlaceholder')}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">{t('analytics.seo.gscMissing')}</p>
                <p className="mt-2 text-sm">{t('analytics.seo.indexPlaceholder')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
