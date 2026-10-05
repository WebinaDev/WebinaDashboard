import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsKpiGrid } from '@module-analytics/components/analytics/AnalyticsKpiGrid'
import { AnalyticsLineChart } from '@module-analytics/components/analytics/AnalyticsLineChart'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type OverviewData = {
  visitors: number
  views: number
  online: number
  series: Array<{ day: string; visitors: number; views: number }>
  source?: 'native' | 'wp-statistics'
}

type CommerceSummary = {
  order_count: number
  revenue: number
  currency?: string
  note?: string
}

export function AnalyticsOverviewPanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'overview', from, to],
    queryFn: () => apiFetch<OverviewData>(`analytics/overview?from=${from}&to=${to}`),
    retry: false,
  })
  useQueryErrorToast(q)

  const commerce = useQuery({
    queryKey: ['analytics', 'commerce-summary', from, to],
    queryFn: () => apiFetch<CommerceSummary>(`analytics/summary?from=${from}&to=${to}`),
    enabled: q.isSuccess,
    retry: false,
  })

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
      <AnalyticsPanelQueryGate query={q} variant="overview" skeletonRows={4} skeletonColumns={4}>
        <div className="space-y-4">
        <AnalyticsKpiGrid
          items={[
            { label: t('analytics.kpi.visitors'), value: formatNumber(d?.visitors ?? 0, i18n.language) },
            { label: t('analytics.kpi.views'), value: formatNumber(d?.views ?? 0, i18n.language) },
            { label: t('analytics.kpi.online'), value: formatNumber(d?.online ?? 0, i18n.language) },
            {
              label: t('analytics.kpi.commerceOrders'),
              value: commerce.data ? formatNumber(commerce.data.order_count, i18n.language) : '—',
            },
          ]}
        />
        <AnalyticsLineChart title={t('analytics.chartViews')} data={d?.series ?? []} dataKey="views" name={t('analytics.kpi.views')} />
        {commerce.data ? (
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{t('analytics.kpi.commerceRevenue')}</p>
              <p className="text-2xl font-semibold">
                <MoneyDisplay
                  amount={commerce.data.revenue}
                  currency={commerce.data.currency ?? store.currency}
                  currencySymbol={store.currencySymbol}
                  locale={i18n.language}
                  amountClassName="text-2xl font-semibold"
                />
              </p>
              {commerce.data.note ? <p className="mt-2 text-xs text-muted-foreground">{commerce.data.note}</p> : null}
            </CardContent>
          </Card>
        ) : null}
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
