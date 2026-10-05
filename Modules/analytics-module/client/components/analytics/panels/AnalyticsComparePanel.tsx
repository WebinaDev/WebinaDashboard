import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AnalyticsDataTable } from '@module-analytics/components/analytics/AnalyticsDataTable'
import { AnalyticsPanelQueryGate } from '@module-analytics/components/analytics/AnalyticsPanelQueryGate'
import { AnalyticsPeriodFilter, useAnalyticsPeriodRange } from '@module-analytics/components/analytics/AnalyticsPeriodFilter'
import { AnalyticsSourceBadge } from '@module-analytics/components/analytics/AnalyticsSourceBadge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type CompareRow = {
  id: string
  current: number | string | null
  previous: number | string | null
  change_pct: number | null
  pending?: boolean
}

type CompareData = {
  rows: CompareRow[]
  session_note?: string | null
  source?: string
  current?: { label?: string }
  previous?: { label?: string }
}

function formatCell(id: string, v: number | string | null | undefined, pending: boolean | undefined, lang: string, t: (k: string) => string): string {
  if (pending || v === null || v === undefined) return '—'
  if (typeof v === 'string') return v || '—'
  if (id === 'avg_duration_ms') {
    const sec = Math.round(v / 1000)
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
  }
  if (id.endsWith('_pct') || id === 'bounce_rate_pct' || id === 'site_conversion_pct') {
    return `${formatNumber(v, lang)}%`
  }
  return formatNumber(v, lang)
}

function metricLabel(id: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    visitors: 'analytics.compare.visitors',
    views: 'analytics.compare.views',
    avg_duration_ms: 'analytics.compare.avgDuration',
    bounce_rate_pct: 'analytics.compare.bounce',
    top_sources: 'analytics.compare.topSources',
    top_pages: 'analytics.compare.topPages',
    site_conversion_pct: 'analytics.compare.siteConversion',
  }
  return t(map[id] ?? id)
}

export function AnalyticsComparePanel() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsPeriodRange()
  const { from, to } = period

  const q = useQuery({
    queryKey: ['analytics', 'compare', from, to],
    queryFn: () => apiFetch<CompareData>(`analytics/compare?from=${from}&to=${to}`),
    retry: false,
  })
  useQueryErrorToast(q)

  const currentLabel = q.data?.current?.label ?? t('analytics.compare.thisMonth')
  const previousLabel = q.data?.previous?.label ?? t('analytics.compare.lastMonth')

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
      <p className="text-muted-foreground text-sm">
        {currentLabel} · {previousLabel}
      </p>
      {q.data?.session_note ? <p className="text-muted-foreground text-xs">{t('analytics.compare.sessionNote')}</p> : null}
      <AnalyticsPanelQueryGate query={q} variant="table" skeletonRows={8} skeletonColumns={4}>
        <AnalyticsDataTable
          columns={[
            { key: 'metric', label: t('analytics.compare.metric') },
            { key: 'current', label: currentLabel },
            { key: 'previous', label: previousLabel },
            { key: 'change', label: t('analytics.compare.change') },
          ]}
          rows={(q.data?.rows ?? []).map((r) => ({
            metric: metricLabel(r.id, t),
            current: formatCell(r.id, r.current, r.pending, i18n.language, t),
            previous: formatCell(r.id, r.previous, r.pending, i18n.language, t),
            change:
              r.change_pct === null || r.change_pct === undefined
                ? '—'
                : `${r.change_pct > 0 ? '+' : ''}${formatNumber(r.change_pct, i18n.language)}%`,
          }))}
          empty={t('analytics.empty')}
        />
      </AnalyticsPanelQueryGate>
    </div>
  )
}
