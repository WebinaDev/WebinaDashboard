import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { translateOrderStatus } from '@/lib/enumLabels'
import type { OrderReportStatusRow } from '@/types/orderReports'

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

type StatusPieChartProps = {
  rows: OrderReportStatusRow[]
}

export function StatusPieChart({ rows }: StatusPieChartProps) {
  const { t } = useTranslation()
  const data = rows
    .filter((r) => r.count > 0)
    .map((r) => ({
      ...r,
      label: translateOrderStatus(t, r.status, r.label),
    }))

  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('reports.chart.byStatus')}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-64 min-w-0 items-center justify-center overflow-hidden pt-0">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('reports.emptyHint')}</p>
        ) : (
          <ChartContainer
            config={{ count: { label: t('reports.orders') } }}
            className="h-full w-full min-w-0 max-w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
