import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MarketplaceBadge } from '@/components/data/MarketplaceBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { MobileListCard } from '@/components/MobileListCard'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { formatDisplayDateTime } from '@/lib/date'
import { localizeDigits } from '@/lib/digits'
import { formatAttributionSource, translateOrderStatus } from '@/lib/enumLabels'
import { cn } from '@/lib/utils'

export type OrderListRow = {
  id: number
  number: string
  status: string
  status_label?: string
  total: string
  currency: string
  date: string | null
  customer_name?: string
  ship_to?: string
  ship_to_maps_url?: string
  shipping_method?: string
  source?: string
  source_type?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  created_via?: string
  marketplace?: string
  remote_order_id?: string
  payment_method?: string
  payment_method_title?: string
  state?: string
  state_label?: string
  customer_id?: number
  is_pos?: boolean
  sales_channel?: string
}

export type OrderSortField = 'id' | 'date' | 'total' | 'status' | 'payment' | 'utm_source' | 'customer'
export type OrderSortOrder = 'asc' | 'desc'

type OrdersTableProps = {
  items: OrderListRow[]
  locale: string
  selectedIds: number[]
  onSelectedChange: (ids: number[]) => void
  orderby: OrderSortField
  order: OrderSortOrder
  onSort: (field: OrderSortField) => void
  detailBase?: string
  selectable?: boolean
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

function SortIcon({ active, order }: { active: boolean; order: OrderSortOrder }) {
  if (!active) return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />
  return order === 'asc' ? <ArrowUp className="size-3.5" aria-hidden /> : <ArrowDown className="size-3.5" aria-hidden />
}

export function OrdersTable({
  items,
  locale,
  selectedIds,
  onSelectedChange,
  orderby,
  order,
  onSort,
  detailBase = '/orders/list',
  selectable = true,
}: OrdersTableProps) {
  const { t } = useTranslation()
  const store = useStoreCurrency()
  const allSelected = items.length > 0 && items.every((row) => selectedIds.includes(row.id))
  const someSelected = items.some((row) => selectedIds.includes(row.id))

  function toggleAll(checked: boolean) {
    if (checked) onSelectedChange(items.map((row) => row.id))
    else onSelectedChange([])
  }

  function toggleRow(id: number, checked: boolean) {
    if (checked) onSelectedChange([...selectedIds, id])
    else onSelectedChange(selectedIds.filter((x) => x !== id))
  }

  function sortableHead(field: OrderSortField, label: string, className?: string) {
    const active = orderby === field
    return (
      <TableHead className={className}>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-medium hover:text-foreground"
          onClick={() => onSort(field)}
        >
          {label}
          <SortIcon active={active} order={active ? order : 'desc'} />
        </button>
      </TableHead>
    )
  }

  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">{t('orders.emptyHint')}</p>
        ) : (
          items.map((row) => {
            const checked = selectedIds.includes(row.id)
            return (
              <MobileListCard
                key={row.id}
                leading={
                  selectable ? (
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggleRow(row.id, v === true)}
                      aria-label={t('orders.selectOrder', { number: localizeDigits(row.number, locale) })}
                    />
                  ) : null
                }
                media={
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <Link to={`${detailBase}/${row.id}`} className="text-primary font-medium hover:underline">
                        #{localizeDigits(row.number, locale)}
                      </Link>
                      <p className="truncate text-sm">{row.customer_name || t('common.emptyValue')}</p>
                      {row.is_pos ? (
                        <Badge variant="outline" className="mt-1">
                          {t('pos.badge')}
                        </Badge>
                      ) : null}
                      <p className="text-muted-foreground text-xs">
                        {formatDisplayDateTime(row.date ?? undefined, locale)}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(row.status)}>{translateOrderStatus(t, row.status)}</Badge>
                  </div>
                }
                actions={
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`${detailBase}/${row.id}`}>
                      <Eye className="size-4" aria-hidden />
                      {t('common.view')}
                    </Link>
                  </Button>
                }
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{t('orders.colTotal')}</span>
                  <MoneyDisplay
                    amount={parseFloat(row.total || '0')}
                    currency={row.currency || store.currency}
                    currencySymbol={store.currencySymbol}
                    locale={locale}
                  />
                </div>
                {row.payment_method_title || row.payment_method ? (
                  <p className="text-muted-foreground truncate text-xs">
                    {row.payment_method_title || row.payment_method}
                  </p>
                ) : null}
              </MobileListCard>
            )
          })
        )}
      </div>

      <div className="hidden md:block">
    <Table>
      <TableHeader>
        <TableRow>
          {selectable ? (
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleAll(v === true)}
              aria-label={t('orders.selectAll')}
            />
          </TableHead>
          ) : null}
          {sortableHead('id', t('orders.colNumber'))}
          {sortableHead('customer', t('orders.colCustomer'))}
          {sortableHead('date', t('orders.colDate'))}
          {sortableHead('status', t('orders.colStatus'))}
          <TableHead>{t('orders.colState')}</TableHead>
          <TableHead>{t('orders.colShipTo')}</TableHead>
          {sortableHead('payment', t('orders.colPayment'))}
          {sortableHead('utm_source', t('orders.colUtm'))}
          {sortableHead('total', t('orders.colTotal'), 'text-end')}
          <TableHead>{t('orders.colSource')}</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={selectable ? 12 : 11} className="text-muted-foreground p-8 text-center text-sm">
              {t('orders.emptyHint')}
            </TableCell>
          </TableRow>
        ) : (
          items.map((row) => {
            const checked = selectedIds.includes(row.id)
            const stateDisplay =
              row.state_label && row.state_label !== row.state
                ? row.state_label
                : row.state_label || (row.state && row.state.length > 3 ? row.state : '')
            return (
              <TableRow key={row.id} data-state={checked ? 'selected' : undefined}>
                {selectable ? (
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => toggleRow(row.id, v === true)}
                    aria-label={t('orders.selectOrder', { number: localizeDigits(row.number, locale) })}
                  />
                </TableCell>
                ) : null}
                <TableCell>
                  <Link to={`${detailBase}/${row.id}`} className="text-primary font-medium hover:underline">
                    #{localizeDigits(row.number, locale)}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{row.customer_name || t('common.emptyValue')}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                  {formatDisplayDateTime(row.date ?? undefined, locale)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(row.status)}>{translateOrderStatus(t, row.status)}</Badge>
                </TableCell>
                <TableCell className="text-sm">{stateDisplay || t('common.emptyValue')}</TableCell>
                <TableCell className="max-w-xs">
                  {row.ship_to ? (
                    <div className="space-y-1">
                      <p className="line-clamp-2 text-sm">{row.ship_to}</p>
                      {row.shipping_method ? (
                        <p className="text-muted-foreground text-xs">{row.shipping_method}</p>
                      ) : null}
                      {row.ship_to_maps_url ? (
                        <a
                          href={row.ship_to_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          {t('orders.openMaps')}
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">{t('common.emptyValue')}</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[8rem] truncate text-sm">
                  {row.payment_method_title || row.payment_method || t('common.emptyValue')}
                </TableCell>
                <TableCell className="max-w-[7rem] truncate text-sm">
                  {row.utm_source || t('common.emptyValue')}
                </TableCell>
                <TableCell className="text-end font-medium whitespace-nowrap">
                  <MoneyDisplay
                    amount={parseFloat(row.total || '0')}
                    currency={row.currency || store.currency}
                    currencySymbol={store.currencySymbol}
                    locale={locale}
                  />
                </TableCell>
                <TableCell
                  className={cn('max-w-[10rem] text-sm', !row.source && !row.marketplace && 'text-muted-foreground')}
                >
                  <div className="flex flex-col gap-1">
                    {row.marketplace ? (
                      <MarketplaceBadge slug={row.marketplace} />
                    ) : row.source || row.source_type || row.created_via ? (
                      <span className="truncate">{formatAttributionSource(t, row)}</span>
                    ) : (
                      t('common.emptyValue')
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon-sm" title={t('common.view')}>
                    <Link to={`${detailBase}/${row.id}`}>
                      <Eye className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
      </div>
    </>
  )
}
