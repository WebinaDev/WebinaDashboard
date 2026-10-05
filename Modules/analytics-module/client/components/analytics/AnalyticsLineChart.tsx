import { useTranslation } from 'react-i18next'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatChartNumber } from '@/lib/chartLocale'
import { formatDisplayDate } from '@/lib/date'

type SeriesRow = { day: string; visitors?: number; views?: number }

export function AnalyticsLineChart({
  title,
  data,
  dataKey,
  name,
}: {
  title: string
  data: SeriesRow[]
  dataKey: 'visitors' | 'views'
  name: string
}) {
  const { t, i18n } = useTranslation()
  const chartData = data.map((r) => ({
    ...r,
    label: formatDisplayDate(`${r.day}T12:00:00`, i18n.language),
  }))
  // Only treat as empty when there is no series at all (backend should fill daily zeros).
  const empty = chartData.length === 0
  const axisFmt = (v: number | string) => formatChartNumber(v, i18n.language)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72 min-h-0 pt-0">
        {empty ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">{t('analytics.emptyChart')}</p>
        ) : (
          <ChartContainer
            config={{
              [dataKey]: { label: name, color: 'hsl(var(--primary))' },
            }}
            className="h-full min-h-[12rem] w-full min-w-0"
          >
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={axisFmt} tick={{ fontSize: 11 }} width={56} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey={dataKey} stroke="var(--color-primary)" strokeWidth={2} dot={false} name={name} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
