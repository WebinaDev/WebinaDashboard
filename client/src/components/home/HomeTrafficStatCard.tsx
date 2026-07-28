import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CartesianGrid, Line, LineChart } from 'recharts'

import { ChangePctBadge } from '@/components/home/HomeProductStatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { formatChartNumber } from '@/lib/chartLocale'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewTraffic } from '@/types/dashboardOverview'

type HomeTrafficStatCardProps = {
  traffic: DashboardOverviewTraffic
  locale: string
}

export function HomeTrafficStatCard({ traffic, locale }: HomeTrafficStatCardProps) {
  const { t, i18n } = useTranslation()
  const chartData = traffic.chart.series.slice(-14)

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('home.sections.traffic')}</CardTitle>
        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
          <Link to="/analytics/overview">{t('home.traffic.viewDetails')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-muted-foreground text-xs">{t('home.traffic.onlineNow')}</p>
          <p className="text-2xl font-semibold">{formatNumber(traffic.online, locale)}</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('home.traffic.highlightVisitors')}</span>
          <span className="font-medium">{formatNumber(traffic.highlight.visitors, locale)}</span>
        </div>
        <ChangePctBadge value={traffic.highlight.visitors_change_pct} />
        <div className="h-28 min-h-0 min-w-0">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-xs">{t('analytics.emptyChart')}</p>
          ) : (
            <ChartContainer
              config={{
                visitors: { label: t('analytics.kpi.visitors'), color: 'hsl(var(--chart-1))' },
                views: { label: t('analytics.kpi.views'), color: 'hsl(var(--chart-2))' },
              }}
              className="h-full min-h-[6rem] w-full"
              initialDimension={{ width: 280, height: 112 }}
            >
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={1.5} dot={false} strokeOpacity={0.6} />
              </LineChart>
            </ChartContainer>
          )}
        </div>
        <p className="text-muted-foreground text-[10px]">
          {t('analytics.kpi.visitors')} / {t('analytics.kpi.views')} — {formatChartNumber(chartData.at(-1)?.visitors ?? 0, i18n.language)}
        </p>
      </CardContent>
    </Card>
  )
}
