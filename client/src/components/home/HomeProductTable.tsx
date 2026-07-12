import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDisplayDate } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewProductRow } from '@/types/dashboardOverview'

type HomeProductTableProps = {
  title: string
  rows: DashboardOverviewProductRow[]
  viewAllHref?: string
  emptyMessage: string
  metricKey?: 'views' | 'revenue' | 'quantity' | 'price'
  currency?: string
  currencySymbol?: string
  locale: string
}

function productId(row: DashboardOverviewProductRow) {
  return row.product_id ?? row.id ?? 0
}

export function HomeProductTable({
  title,
  rows,
  viewAllHref,
  emptyMessage,
  metricKey,
  currency,
  currencySymbol,
  locale,
}: HomeProductTableProps) {
  const { t, i18n } = useTranslation()

  const metricLabel =
    metricKey === 'views'
      ? t('products.colViews')
      : metricKey === 'revenue'
        ? t('reports.revenue')
        : metricKey === 'quantity'
          ? t('reports.table.quantity')
          : metricKey === 'price'
            ? t('products.colPrice')
            : null

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
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
                <TableHead className="w-12" />
                <TableHead>{t('reports.table.product')}</TableHead>
                {metricLabel ? <TableHead className="text-end">{metricLabel}</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const pid = productId(row)
                return (
                  <TableRow key={pid} className="hover:bg-muted/50">
                    <TableCell>
                      <Avatar className="size-9 rounded-md">
                        {row.image_url ? <AvatarImage src={row.image_url} alt={row.name || t('a11y.thumbnail')} /> : null}
                        <AvatarFallback className="rounded-md text-xs">{row.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Link className="text-primary line-clamp-2 hover:underline" to={`/shop/products/${pid}`}>
                        {row.name}
                      </Link>
                      {row.date && metricKey !== 'price' ? (
                        <p className="text-muted-foreground text-xs">{formatDisplayDate(row.date, i18n.language)}</p>
                      ) : null}
                    </TableCell>
                    {metricLabel ? (
                      <TableCell className="text-end">
                        {metricKey === 'views' ? formatNumber(row.views ?? 0, locale) : null}
                        {metricKey === 'quantity' ? formatNumber(row.quantity ?? 0, locale) : null}
                        {metricKey === 'revenue' && currency ? (
                          <MoneyDisplay amount={row.revenue ?? 0} currency={currency} currencySymbol={currencySymbol} locale={locale} />
                        ) : null}
                        {metricKey === 'price' && row.price && currency ? (
                          Number.isFinite(parseFloat(row.price)) ? (
                            <MoneyDisplay amount={parseFloat(row.price)} currency={currency} currencySymbol={currencySymbol} locale={locale} />
                          ) : (
                            row.price
                          )
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
