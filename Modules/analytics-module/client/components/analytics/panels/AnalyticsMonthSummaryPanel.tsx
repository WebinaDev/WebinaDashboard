import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import { cn } from '@/lib/utils'

type DeltaRow = {
  id: string
  change_pct: number | null
  current: number | null
  previous: number | null
}

type Highlight = {
  id: string
  change_pct: number
  current: number | null
  previous: number | null
}

type MonthSummaryData = {
  status: 'growth' | 'stable' | 'decline'
  score: number
  composite?: number
  achievement: Highlight | null
  challenge: Highlight | null
  deltas: DeltaRow[]
  source?: string
  current?: { label?: string }
  previous?: { label?: string }
}

function kpiLabel(id: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    revenue: 'analytics.monthSummary.kpi.revenue',
    order_count: 'analytics.monthSummary.kpi.orders',
    visitors: 'analytics.monthSummary.kpi.visitors',
    conversion: 'analytics.monthSummary.kpi.conversion',
  }
  return t(map[id] ?? id)
}

function pctLabel(v: number | null | undefined, lang: string): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${formatNumber(v, lang)}%`
}

function statusClass(status: MonthSummaryData['status']): string {
  if (status === 'growth') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
  if (status === 'decline') return 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
  return 'bg-muted text-muted-foreground'
}

export function AnalyticsMonthSummaryPanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'month-summary', from, to],
    queryFn: () => apiFetch<MonthSummaryData>(`analytics/month-summary?from=${from}&to=${to}`),
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
      <p className="text-muted-foreground text-sm">
        {d?.current?.label ?? t('analytics.compare.thisMonth')} · {d?.previous?.label ?? t('analytics.compare.lastMonth')}
      </p>

      <AnalyticsPanelQueryGate query={q} variant="overview" skeletonRows={3} skeletonColumns={2}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium',
                statusClass(d?.status ?? 'stable'),
              )}
            >
              {t(`analytics.monthSummary.status.${d?.status ?? 'stable'}`)}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-muted-foreground text-sm">{t('analytics.monthSummary.score')}</span>
              <span className="text-2xl font-semibold tabular-nums">{formatNumber(d?.score ?? 0, i18n.language)}</span>
              <span className="text-muted-foreground text-sm">/ 10</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-border/60 space-y-1 rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {t('analytics.monthSummary.achievement')}
              </p>
              {d?.achievement ? (
                <>
                  <p className="text-base font-medium">{kpiLabel(d.achievement.id, t)}</p>
                  <p className="text-emerald-600 text-sm dark:text-emerald-400">
                    {pctLabel(d.achievement.change_pct, i18n.language)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">{t('analytics.monthSummary.noAchievement')}</p>
              )}
            </div>
            <div className="border-border/60 space-y-1 rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {t('analytics.monthSummary.challenge')}
              </p>
              {d?.challenge ? (
                <>
                  <p className="text-base font-medium">{kpiLabel(d.challenge.id, t)}</p>
                  <p className="text-rose-600 text-sm dark:text-rose-400">
                    {pctLabel(d.challenge.change_pct, i18n.language)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">{t('analytics.monthSummary.noChallenge')}</p>
              )}
            </div>
          </div>

          <AnalyticsDataTable
            columns={[
              { key: 'metric', label: t('analytics.compare.metric') },
              { key: 'change', label: t('analytics.compare.change') },
            ]}
            rows={(d?.deltas ?? []).map((r) => ({
              metric: kpiLabel(r.id, t),
              change: pctLabel(r.change_pct, i18n.language),
            }))}
            empty={t('analytics.empty')}
          />
        </div>
      </AnalyticsPanelQueryGate>
    </div>
  )
}
