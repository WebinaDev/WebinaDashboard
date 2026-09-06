import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatChartNumber } from '@/lib/chartLocale'

type UtmBarRow = {
  label: string
  revenue: number
  count: number
  profit?: number
}

type UtmBarChartProps = {
  rows: UtmBarRow[]
  locale: string
  title?: string
}

export function UtmBarChart({ rows, locale, title }: UtmBarChartProps) {
  const { t } = useTranslation()
  const data = rows.slice(0, 10).map((r) => ({
    name: r.label.length > 28 ? `${r.label.slice(0, 26)}…` : r.label,
    revenue: r.revenue,
    count: r.count,
    profit: r.profit ?? 0,
  }))
  const axisFmt = (v: number | string) => formatChartNumber(v, locale)

  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title ?? t('reports.financial.chart.byUtm')}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 min-w-0 overflow-hidden pt-0">
        {data.length === 0 ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">{t('reports.emptyHint')}</p>
        ) : (
          <ChartContainer
            config={{
              revenue: { label: t('reports.revenue'), color: 'var(--color-chart-2)' },
              profit: { label: t('reports.table.profit'), color: 'var(--color-chart-3)' },
            }}
            className="h-full min-w-0 w-full max-w-full"
          >
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickFormatter={axisFmt} hide />
              <YAxis type="category" dataKey="name" width={72} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
