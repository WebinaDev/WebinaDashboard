import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { MobileListCard } from '@/components/MobileListCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDisplayDate } from '@/lib/date'
import { localizeDigits } from '@/lib/digits'
import { translateOrderStatus } from '@/lib/enumLabels'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewOrderRow } from '@/types/dashboardOverview'

type HomeOrdersTableProps = {
  title: string
  rows: DashboardOverviewOrderRow[]
  monthLabel?: string
  viewAllHref?: string
  orderHrefBase?: string
  emptyMessage: string
  currency: string
  currencySymbol?: string
  locale: string
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'processing':
      return 'secondary'
    case 'cancelled':
    case 'failed':
    case 'refunded':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function HomeOrdersTable({
  title,
  rows,
  monthLabel,
  viewAllHref,
  orderHrefBase = '/orders/list',
  emptyMessage,
  currency,
  currencySymbol,
  locale,
}: HomeOrdersTableProps) {
  const { t, i18n } = useTranslation()

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {monthLabel ? <p className="text-muted-foreground text-xs">{monthLabel}</p> : null}
        </div>
        {viewAllHref ? (
          <Link className="text-primary shrink-0 text-xs hover:underline" to={viewAllHref}>
            {t('home.viewAll')}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="min-w-0 p-0 pt-2">
        {rows.length === 0 ? (
          <p className="text-muted-foreground px-4 pb-4 text-sm">{emptyMessage}</p>
        ) : (
          <>
            <div className="space-y-3 px-3 pb-3 md:hidden">
              {rows.map((row) => (
                <MobileListCard
                  key={row.id}
                  media={
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <Link
                          className="text-primary font-medium hover:underline"
                          to={`${orderHrefBase}/${row.id}`}
                        >
                          #{localizeDigits(row.number || String(row.id), locale)}
                        </Link>
                        <p className="truncate text-sm">{row.customer_name || '—'}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatDisplayDate(row.date, i18n.language)}
                        </p>
                      </div>
                      <Badge variant={statusBadgeVariant(row.status)} className="shrink-0">
                        {translateOrderStatus(t, row.status, row.status_label)}
                      </Badge>
                    </div>
                  }
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{t('home.tables.colTotal')}</span>
                    {Number.isFinite(parseFloat(row.total)) ? (
                      <MoneyDisplay
                        amount={parseFloat(row.total)}
                        currency={currency}
                        currencySymbol={currencySymbol}
                        locale={locale}
                      />
                    ) : (
                      <span className="break-words">{row.total}</span>
                    )}
                  </div>
                </MobileListCard>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                        <Link className="text-primary font-medium hover:underline" to={`${orderHrefBase}/${row.id}`}>
                          #{row.number || formatNumber(row.id, locale)}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[10rem] truncate">{row.customer_name || '—'}</TableCell>
                      <TableCell>{translateOrderStatus(t, row.status, row.status_label)}</TableCell>
                      <TableCell className="text-end">
                        {Number.isFinite(parseFloat(row.total)) ? (
                          <MoneyDisplay
                            amount={parseFloat(row.total)}
                            currency={currency}
                            currencySymbol={currencySymbol}
                            locale={locale}
                          />
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
