import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatChartNumber } from '@/lib/chartLocale'
import type { OrderReportPriceTierRow } from '@/types/orderReports'

type PriceTierChartProps = {
  rows: OrderReportPriceTierRow[]
  locale: string
}

export function PriceTierChart({ rows, locale }: PriceTierChartProps) {
  const { t } = useTranslation()
  const axisFmt = (v: number | string) => formatChartNumber(v, locale)

  const data = useMemo(() => {
    return rows.map((r) => ({
      name: r.label || t(`reports.tier.${r.tier}`, { defaultValue: r.tier }),
      revenue: r.revenue,
      profit: r.profit,
      margin_pct: r.margin_pct,
    }))
  }, [rows, t])

  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('reports.chart.byPriceTier')}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 min-w-0 overflow-hidden pt-0">
        {data.length === 0 ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">{t('reports.emptyHint')}</p>
        ) : (
          <ChartContainer
            config={{
              revenue: { label: t('reports.revenue'), color: 'var(--color-chart-1)' },
              profit: { label: t('reports.table.profit'), color: 'var(--color-chart-3)' },
            }}
            className="h-full min-w-0 w-full max-w-full"
          >
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickFormatter={axisFmt} hide />
              <YAxis type="category" dataKey="name" width={64} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
