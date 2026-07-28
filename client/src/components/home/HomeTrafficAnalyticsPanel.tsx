import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts'

import { ChangePctBadge } from '@/components/home/HomeProductStatsCard'
import { HomeTrafficPeriodsTable } from '@/components/home/HomeTrafficPeriodsTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { formatChartNumber } from '@/lib/chartLocale'
import { formatDisplayDate } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewTraffic } from '@/types/dashboardOverview'

type HomeTrafficAnalyticsPanelProps = {
  traffic: DashboardOverviewTraffic
  locale: string
}

function formatDayLabel(day: string, locale: string) {
  return formatDisplayDate(`${day}T12:00:00`, locale)
}

export function HomeTrafficAnalyticsPanel({ traffic, locale }: HomeTrafficAnalyticsPanelProps) {
  const { t, i18n } = useTranslation()

  const chartData = useMemo(
    () =>
      traffic.chart.series.map((r) => ({
        ...r,
        label: formatDayLabel(r.day, i18n.language),
      })),
    [traffic.chart.series, i18n.language],
  )

  const recentDays = useMemo(() => traffic.chart.series.slice(-2).reverse(), [traffic.chart.series])

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t('home.sections.traffic')}</CardTitle>
        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
          <Link to="/analytics/overview">{t('home.traffic.viewDetails')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">{t('home.traffic.onlineVisitors')}</p>
            <p className="text-3xl font-semibold tracking-tight">{formatNumber(traffic.online, locale)}</p>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <div>
              <p className="text-sm font-medium">{t('home.traffic.last7ExclToday')}</p>
              <p className="text-muted-foreground text-xs">{t('home.traffic.vsPrevPeriod')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-muted-foreground text-xs">{t('analytics.kpi.visitors')}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-semibold">{formatNumber(traffic.highlight.visitors, locale)}</span>
                  <ChangePctBadge value={traffic.highlight.visitors_change_pct} />
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-muted-foreground text-xs">{t('analytics.kpi.views')}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-semibold">{formatNumber(traffic.highlight.views, locale)}</span>
                  <ChangePctBadge value={traffic.highlight.views_change_pct} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t('home.traffic.chartTitle')}</p>
          <div className="h-44 min-h-0 min-w-0">
            {chartData.length === 0 ? (
              <p className="text-muted-foreground flex h-full items-center justify-center text-sm">{t('analytics.emptyChart')}</p>
            ) : (
              <ChartContainer
                config={{
                  visitors: { label: t('analytics.kpi.visitors'), color: 'hsl(var(--chart-1))' },
                  views: { label: t('analytics.kpi.views'), color: 'hsl(var(--chart-2))' },
                }}
                className="h-full min-h-[8rem] w-full"
              >
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v) => formatChartNumber(v, i18n.language)} tick={{ fontSize: 10 }} width={48} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="var(--color-visitors)"
                    strokeWidth={2}
                    dot={false}
                    name={t('analytics.kpi.visitors')}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-views)"
                    strokeWidth={2}
                    dot={false}
                    name={t('analytics.kpi.views')}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </div>

        {recentDays.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('home.traffic.recentDays')}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {recentDays.map((day) => (
                <li key={day.day} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{formatDayLabel(day.day, i18n.language)}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t('analytics.kpi.visitors')}: {formatNumber(day.visitors, locale)} — {t('analytics.kpi.views')}:{' '}
                    {formatNumber(day.views, locale)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-sm font-medium">{t('home.traffic.periodsTitle')}</p>
          <HomeTrafficPeriodsTable periods={traffic.periods} locale={locale} embedded />
        </div>
      </CardContent>
    </Card>
  )
}
