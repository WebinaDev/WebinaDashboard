import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { MobileListCard } from '@/components/MobileListCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportCategoryRow } from '@/types/orderReports'

type TopCategoriesTableProps = {
  rows: OrderReportCategoryRow[]
  currency: string
  currencySymbol?: string
  locale: string
}

export function TopCategoriesTable({ rows, currency, currencySymbol, locale }: TopCategoriesTableProps) {
  const { t } = useTranslation()

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('reports.table.topCategories')}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 p-0 pt-2">
        {rows.length === 0 ? (
          <p className="text-muted-foreground px-4 pb-4 text-sm">{t('reports.emptyHint')}</p>
        ) : (
          <>
            <div className="space-y-3 px-3 pb-3 md:hidden">
              {rows.map((r) => (
                <MobileListCard
                  key={r.term_id}
                  media={<p className="min-w-0 break-words font-medium">{r.name}</p>}
                >
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('reports.table.quantity')}</dt>
                      <dd>{formatNumber(r.quantity, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('reports.revenue')}</dt>
                      <dd>
                        <MoneyDisplay
                          amount={r.revenue}
                          currency={currency}
                          currencySymbol={currencySymbol}
                          locale={locale}
                        />
                      </dd>
                    </div>
                  </dl>
                </MobileListCard>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.table.category')}</TableHead>
                    <TableHead className="text-end">{t('reports.table.quantity')}</TableHead>
                    <TableHead className="text-end">{t('reports.revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.term_id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-end">{formatNumber(r.quantity, locale)}</TableCell>
                      <TableCell className="text-end">
                        <MoneyDisplay
                          amount={r.revenue}
                          currency={currency}
                          currencySymbol={currencySymbol}
                          locale={locale}
                        />
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
