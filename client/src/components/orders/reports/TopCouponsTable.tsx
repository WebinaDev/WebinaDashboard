import { useTranslation } from 'react-i18next'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/formatNumber'
import type { OrderReportCouponRow } from '@/types/orderReports'

type Props = {
  rows: OrderReportCouponRow[]
  currency: string
  currencySymbol?: string
  locale: string
}

export function TopCouponsTable({ rows, currency, currencySymbol, locale }: Props) {
  const { t } = useTranslation()
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t('reports.table.topCoupons')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 pt-2">
        {rows.length === 0 ? (
          <p className="text-muted-foreground px-4 pb-4 text-sm">{t('reports.emptyHint')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.table.coupon')}</TableHead>
                <TableHead className="text-end">{t('reports.table.usage')}</TableHead>
                <TableHead className="text-end">{t('reports.revenue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.code}>
                  <TableCell>{r.code}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.count, locale)}</TableCell>
                  <TableCell className="text-end">
                    <MoneyDisplay amount={r.revenue} currency={currency} currencySymbol={currencySymbol} locale={locale} />
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
