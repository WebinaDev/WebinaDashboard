import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsKpiGrid } from '@module-analytics/components/analytics/AnalyticsKpiGrid'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import { utmDisplayLabel } from '@/lib/utmLabel'

type CommerceData = {
  order_count: number
  revenue: number
  avg_order_value: number
  currency?: string
  conversion_rate_pct: number | null
  sales_site: number
  sales_instagram: number
  sales_other: number
  new_customers: number
  returning_customers: number
  compare?: Record<string, number | null>
  by_utm_source?: Array<{ source?: string; revenue?: number; count?: number }>
  source?: string
}

function pctLabel(v: number | null | undefined, lang: string): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${formatNumber(v, lang)}%`
}

export function AnalyticsCommercePanel() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'commerce', from, to],
    queryFn: () => apiFetch<CommerceData>(`analytics/commerce?from=${from}&to=${to}`),
    retry: false,
  })
  useQueryErrorToast(q)
  const d = q.data
  const cur = d?.currency ?? store.currency

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
      <AnalyticsPanelQueryGate query={q} variant="overview" skeletonRows={4} skeletonColumns={4}>
        <div className="space-y-4">
          <AnalyticsKpiGrid
            items={[
              {
                label: t('analytics.kpi.orders'),
                value: `${formatNumber(d?.order_count ?? 0, i18n.language)} (${pctLabel(d?.compare?.order_count_pct, i18n.language)})`,
              },
              {
                label: t('analytics.kpi.revenue'),
                value: (
                  <span className="inline-flex flex-col gap-0.5">
                    <MoneyDisplay amount={d?.revenue ?? 0} currency={cur} currencySymbol={store.currencySymbol} locale={i18n.language} />
                    <span className="text-muted-foreground text-xs font-normal">{pctLabel(d?.compare?.revenue_pct, i18n.language)}</span>
                  </span>
                ),
              },
              {
                label: t('analytics.kpi.aov'),
                value: (
                  <MoneyDisplay amount={d?.avg_order_value ?? 0} currency={cur} currencySymbol={store.currencySymbol} locale={i18n.language} />
                ),
              },
              {
                label: t('analytics.kpi.conversion'),
                value: d?.conversion_rate_pct == null ? '—' : `${formatNumber(d.conversion_rate_pct, i18n.language)}%`,
              },
              {
                label: t('analytics.kpi.salesSite'),
                value: <MoneyDisplay amount={d?.sales_site ?? 0} currency={cur} currencySymbol={store.currencySymbol} locale={i18n.language} />,
              },
              {
                label: t('analytics.kpi.salesInstagram'),
                value: <MoneyDisplay amount={d?.sales_instagram ?? 0} currency={cur} currencySymbol={store.currencySymbol} locale={i18n.language} />,
              },
              {
                label: t('analytics.kpi.salesOther'),
                value: <MoneyDisplay amount={d?.sales_other ?? 0} currency={cur} currencySymbol={store.currencySymbol} locale={i18n.language} />,
              },
              {
                label: t('analytics.kpi.newCustomers'),
                value: formatNumber(d?.new_customers ?? 0, i18n.language),
              },
              {
                label: t('analytics.kpi.returningCustomers'),
                value: formatNumber(d?.returning_customers ?? 0, i18n.language),
              },
            ]}
          />
          <AnalyticsDataTable
            columns={[
              { key: 'source', label: t('analytics.col.source') },
              { key: 'orders', label: t('analytics.kpi.orders') },
              { key: 'revenue', label: t('analytics.kpi.revenue') },
            ]}
            rows={(d?.by_utm_source ?? []).map((r) => ({
              source: utmDisplayLabel(r.source, t),
              orders: formatNumber(r.count ?? 0, i18n.language),
              revenue: formatNumber(r.revenue ?? 0, i18n.language),
            }))}
            empty={t('analytics.empty')}
          />
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
