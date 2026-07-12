import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDisplayDate } from '@/lib/date'
import { translateOrderStatus } from '@/lib/enumLabels'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewOrderRow } from '@/types/dashboardOverview'

type HomeOrdersTableProps = {
  title: string
  rows: DashboardOverviewOrderRow[]
  monthLabel?: string
  viewAllHref?: string
  emptyMessage: string
  currency: string
  currencySymbol?: string
  locale: string
}

export function HomeOrdersTable({
  title,
  rows,
  monthLabel,
  viewAllHref,
  emptyMessage,
  currency,
  currencySymbol,
  locale,
}: HomeOrdersTableProps) {
  const { t, i18n } = useTranslation()

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {monthLabel ? <p className="text-muted-foreground text-xs">{monthLabel}</p> : null}
        </div>
        {viewAllHref ? (
          <Link className="text-primary text-xs hover:underline" to={viewAllHref}>
            {t('home.viewAll')}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 pt-2">
        {rows.length === 0 ? (
          <p className="text-muted-foreground px-4 pb-4 text-sm">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('home.tables.colOrder')}</TableHead>
                <TableHead>{t('home.tables.colCustomer')}</TableHead>
                <TableHead>{t('home.tables.colStatus')}</TableHead>
                <TableHead className="text-end">{t('home.tables.colTotal')}</TableHead>
                <TableHead className="text-end">{t('home.tables.colDate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link className="text-primary font-medium hover:underline" to={`/orders/list/${row.id}`}>
                      #{row.number || formatNumber(row.id, locale)}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[10rem] truncate">{row.customer_name || '—'}</TableCell>
                  <TableCell>{row.status_label || translateOrderStatus(t, row.status)}</TableCell>
                  <TableCell className="text-end">
                    {Number.isFinite(parseFloat(row.total)) ? (
                      <MoneyDisplay amount={parseFloat(row.total)} currency={currency} currencySymbol={currencySymbol} locale={locale} />
                    ) : (
                      row.total
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-end text-xs">
                    {formatDisplayDate(row.date, i18n.language)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
