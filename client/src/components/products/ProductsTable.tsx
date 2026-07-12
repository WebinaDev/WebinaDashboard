import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { ProductRowActions } from '@/components/products/ProductRowActions'
import type { ProductColumnVisibility, ProductListRow } from '@/components/products/types'
import { Badge } from '@/components/ui/badge'
import { LazyImage } from '@/components/ui/lazy-image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { formatDisplayDate } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'
import { translateEnum } from '@/lib/enumLabels'

type ProductsTableProps = {
  items: ProductListRow[]
  columns: ProductColumnVisibility
  locale: string
  emptyMessage: string
  visibleColumnCount: number
  busyId: number | null
  onDuplicate: (id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onSyncChannel: (id: number, provider: 'bale' | 'telegram') => Promise<void>
}

function termList(terms: { name: string }[]): string {
  if (!terms.length) return '—'
  return terms.map((t) => t.name).join(', ')
}

function moneyCell(
  amount: number | null | undefined,
  currency: string,
  currencySymbol: string,
  locale: string,
) {
  if (amount == null || Number.isNaN(amount) || amount <= 0) return '—'
  return (
    <MoneyDisplay amount={amount} currency={currency} currencySymbol={currencySymbol} locale={locale} />
  )
}

export function ProductsTable({
  items,
  columns,
  locale,
  emptyMessage,
  visibleColumnCount,
  busyId,
  onDuplicate,
  onDelete,
  onSyncChannel,
}: ProductsTableProps) {
  const { t } = useTranslation()
  const store = useStoreCurrency()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.image ? <TableHead className="w-14">{t('products.colImage')}</TableHead> : null}
          {columns.name ? <TableHead>{t('products.colName')}</TableHead> : null}
          {columns.sku ? <TableHead>{t('products.colSku')}</TableHead> : null}
          {columns.purchase_price ? <TableHead>{t('products.colPurchase')}</TableHead> : null}
          {columns.retail ? <TableHead>{t('products.colRetail')}</TableHead> : null}
          {columns.installment ? <TableHead>{t('products.colInstallment')}</TableHead> : null}
          {columns.credit ? <TableHead>{t('products.colCredit')}</TableHead> : null}
          {columns.wholesale ? <TableHead>{t('products.colWholesale')}</TableHead> : null}
          {columns.discount ? <TableHead>{t('products.colDiscount')}</TableHead> : null}
          {columns.price ? <TableHead>{t('products.colPrice')}</TableHead> : null}
          {columns.sale ? <TableHead>{t('products.colSale')}</TableHead> : null}
          {columns.stock ? <TableHead>{t('products.colStock')}</TableHead> : null}
          {columns.brand ? <TableHead>{t('products.colBrand')}</TableHead> : null}
          {columns.categories ? <TableHead>{t('products.colCategories')}</TableHead> : null}
          {columns.tags ? <TableHead>{t('products.colTags')}</TableHead> : null}
          {columns.date ? <TableHead>{t('products.colDate')}</TableHead> : null}
          {columns.views ? <TableHead>{t('products.colViews')}</TableHead> : null}
          {columns.status ? <TableHead>{t('products.colStatus')}</TableHead> : null}
          {columns.type ? <TableHead>{t('products.colType')}</TableHead> : null}
          <TableHead className="w-44">{t('products.colActions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={visibleColumnCount} className="text-muted-foreground py-8 text-center text-sm">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          items.map((row) => {
            const currency = row.wfcp?.settings_currency ?? store.currency
            const wfcp = row.wfcp

            return (
              <TableRow key={row.id}>
                {columns.image ? (
                  <TableCell>
                    {row.image_url ? (
                      <LazyImage src={row.image_url} alt={row.name || t('a11y.thumbnail')} className="size-10 rounded object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                ) : null}
                {columns.name ? (
                  <TableCell className="min-w-[10rem] font-medium">
                    <Link to={`/shop/products/${row.id}`} className="hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                ) : null}
                {columns.sku ? <TableCell className="text-xs">{row.sku || '—'}</TableCell> : null}
                {columns.purchase_price ? (
                  <TableCell>
                    {moneyCell(wfcp?.purchase_price ?? null, currency, store.currencySymbol, locale)}
                  </TableCell>
                ) : null}
                {columns.retail ? (
                  <TableCell>{moneyCell(wfcp?.retail ?? null, currency, store.currencySymbol, locale)}</TableCell>
                ) : null}
                {columns.installment ? (
                  <TableCell>{moneyCell(wfcp?.installment ?? null, currency, store.currencySymbol, locale)}</TableCell>
                ) : null}
                {columns.credit ? (
                  <TableCell>{moneyCell(wfcp?.credit ?? null, currency, store.currencySymbol, locale)}</TableCell>
                ) : null}
                {columns.wholesale ? (
                  <TableCell>{moneyCell(wfcp?.wholesale ?? null, currency, store.currencySymbol, locale)}</TableCell>
                ) : null}
                {columns.discount ? (
                  <TableCell>
                    {row.discount_percent != null ? `${formatNumber(row.discount_percent, locale)}%` : '—'}
                  </TableCell>
                ) : null}
                {columns.price ? (
                  <TableCell>
                    <MoneyDisplay
                      amount={parseFloat(row.price || '0')}
                      currency={currency}
                      currencySymbol={store.currencySymbol}
                      locale={locale}
                    />
                  </TableCell>
                ) : null}
                {columns.sale ? (
                  <TableCell>
                    {row.sale ? (
                      <MoneyDisplay
                        amount={parseFloat(row.sale)}
                        currency={currency}
                        currencySymbol={store.currencySymbol}
                        locale={locale}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                ) : null}
                {columns.stock ? (
                  <TableCell>
                    {row.manage_stock ? (row.stock ?? '—') : translateEnum(t, 'products.stockStatus', row.stock_status)}
                  </TableCell>
                ) : null}
                {columns.brand ? <TableCell className="text-sm">{row.brand?.name ?? '—'}</TableCell> : null}
                {columns.categories ? (
                  <TableCell className="max-w-[12rem] truncate text-sm" title={termList(row.categories)}>
                    {termList(row.categories)}
                  </TableCell>
                ) : null}
                {columns.tags ? (
                  <TableCell className="max-w-[12rem] truncate text-sm" title={termList(row.tags)}>
                    {termList(row.tags)}
                  </TableCell>
                ) : null}
                {columns.date ? (
                  <TableCell className="text-sm whitespace-nowrap">{formatDisplayDate(row.date ?? undefined, locale)}</TableCell>
                ) : null}
                {columns.views ? (
                  <TableCell className="text-sm">
                    {row.views != null ? formatNumber(row.views, locale) : '—'}
                  </TableCell>
                ) : null}
                {columns.status ? (
                  <TableCell>
                    <Badge variant="secondary">{translateEnum(t, 'products.status', row.status)}</Badge>
                  </TableCell>
                ) : null}
                {columns.type ? (
                  <TableCell className="text-sm">{translateEnum(t, 'products.productType', row.type)}</TableCell>
                ) : null}
                <TableCell>
                  <ProductRowActions
                    row={row}
                    busy={busyId === row.id}
                    onDuplicate={() => onDuplicate(row.id)}
                    onDelete={() => onDelete(row.id)}
                    onSyncChannel={(provider) => onSyncChannel(row.id, provider)}
                  />
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
