import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { MobileListCard } from '@/components/MobileListCard'
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

  function renderMetric(row: DashboardOverviewProductRow) {
    if (!metricLabel || !metricKey) return null
    if (metricKey === 'views') return formatNumber(row.views ?? 0, locale)
    if (metricKey === 'quantity') return formatNumber(row.quantity ?? 0, locale)
    if (metricKey === 'revenue' && currency) {
      return (
        <MoneyDisplay amount={row.revenue ?? 0} currency={currency} currencySymbol={currencySymbol} locale={locale} />
      )
    }
    if (metricKey === 'price' && row.price && currency) {
      return Number.isFinite(parseFloat(row.price)) ? (
        <MoneyDisplay
          amount={parseFloat(row.price)}
          currency={currency}
          currencySymbol={currencySymbol}
          locale={locale}
        />
      ) : (
        row.price
      )
    }
    return null
  }

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="min-w-0 text-base font-medium">{title}</CardTitle>
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
              {rows.map((row) => {
                const pid = productId(row)
                return (
                  <MobileListCard
                    key={pid}
                    media={
                      <div className="flex gap-3">
                        <Avatar className="size-12 shrink-0 rounded-lg">
                          {row.image_url ? (
                            <AvatarImage src={row.image_url} alt={row.name || t('a11y.thumbnail')} />
                          ) : null}
                          <AvatarFallback className="rounded-lg text-xs">{row.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link
                            className="text-primary line-clamp-2 break-words font-medium hover:underline"
                            to={`/shop/products/${pid}`}
                          >
                            {row.name}
                          </Link>
                          {row.date && metricKey !== 'price' ? (
                            <p className="text-muted-foreground text-xs">
                              {formatDisplayDate(row.date, i18n.language)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    }
                  >
                    {metricLabel ? (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">{metricLabel}</span>
                        <span className="min-w-0 text-end">{renderMetric(row)}</span>
                      </div>
                    ) : null}
                  </MobileListCard>
                )
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                            {row.image_url ? (
                              <AvatarImage src={row.image_url} alt={row.name || t('a11y.thumbnail')} />
                            ) : null}
                            <AvatarFallback className="rounded-md text-xs">{row.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Link className="text-primary line-clamp-2 hover:underline" to={`/shop/products/${pid}`}>
                            {row.name}
                          </Link>
                          {row.date && metricKey !== 'price' ? (
                            <p className="text-muted-foreground text-xs">
                              {formatDisplayDate(row.date, i18n.language)}
                            </p>
                          ) : null}
                        </TableCell>
                        {metricLabel ? <TableCell className="text-end">{renderMetric(row)}</TableCell> : null}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
