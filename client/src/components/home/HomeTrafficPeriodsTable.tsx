import { useTranslation } from 'react-i18next'

import { ChangePctBadge } from '@/components/home/HomeProductStatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCompactNumber, formatNumber } from '@/lib/formatNumber'
import type { DashboardTrafficPeriod } from '@/types/dashboardOverview'

const PERIOD_LABELS: Record<string, string> = {
  today: 'home.traffic.periodToday',
  yesterday: 'home.traffic.periodYesterday',
  last7_excl_today: 'home.traffic.last7Recent',
  last14_excl_today: 'home.traffic.last14Recent',
  all_time: 'home.traffic.allTime',
}

function MetricCell({
  value,
  changePct,
  locale,
  compact,
}: {
  value: number
  changePct: number | null
  locale: string
  compact?: boolean
}) {
  const fmt = compact ? formatCompactNumber : formatNumber
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-medium tabular-nums">{fmt(value, locale)}</span>
      {changePct !== null ? <ChangePctBadge value={changePct} /> : null}
    </div>
  )
}

type HomeTrafficPeriodsTableProps = {
  periods: DashboardTrafficPeriod[]
  locale: string
  embedded?: boolean
}

export function HomeTrafficPeriodsTable({ periods, locale, embedded }: HomeTrafficPeriodsTableProps) {
  const { t } = useTranslation()

  const table = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('home.traffic.period')}</TableHead>
          <TableHead className="text-end">{t('analytics.kpi.visitors')}</TableHead>
          <TableHead className="text-end">{t('analytics.kpi.views')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.map((row) => {
          const showPct = row.id !== 'today' && row.id !== 'all_time'
          const compact = row.visitors >= 1000 || row.views >= 1000
          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{t(PERIOD_LABELS[row.id] ?? row.id, row.id)}</TableCell>
              <TableCell className="text-end">
                <MetricCell
                  value={row.visitors}
                  changePct={showPct ? row.visitors_change_pct : null}
                  locale={locale}
                  compact={compact}
                />
              </TableCell>
              <TableCell className="text-end">
                <MetricCell
                  value={row.views}
                  changePct={showPct ? row.views_change_pct : null}
                  locale={locale}
                  compact={compact}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  if (embedded) {
    return <div className="overflow-x-auto">{table}</div>
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('home.traffic.periodsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 pt-2">{table}</CardContent>
    </Card>
  )
}
