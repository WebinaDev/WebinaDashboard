import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PostsPagination } from '@/components/magazine/PostsPagination'
import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Badge } from '@/components/ui/badge'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { localizeDigits } from '@/lib/digits'
import { translateOrderStatus } from '@/lib/enumLabels'
import { formatNumber } from '@/lib/formatNumber'

type CustomerHistory = {
  order_count: number
  total_spent: number
  avg_order_value: number
}

type OrderLite = {
  id: number
  number: string
  status: string
  total: string
  currency: string
  date: string | null
}

type OrderCustomerHistoryPanelProps = {
  history?: CustomerHistory
  currency: string
  locale: string
  isGuest?: boolean
  customerId?: number
  customerEmail?: string
  customerPhone?: string
  currentOrderId?: number
}

export function OrderCustomerHistoryPanel({
  history,
  currency,
  locale,
  isGuest,
  customerId,
  customerEmail,
  customerPhone,
  currentOrderId,
}: OrderCustomerHistoryPanelProps) {
  const { t } = useTranslation()
  const store = useStoreCurrency()
  const displayCurrency = currency || store.currency
  const [page, setPage] = useState(1)
  const customerParam =
    customerId && customerId > 0
      ? String(customerId)
      : customerEmail || customerPhone || ''

  const listQ = useQuery({
    queryKey: ['orders', 'customer-history', customerParam, page],
    queryFn: () =>
      apiFetch<{ items: OrderLite[]; found: number }>(
        `shop/orders?customer=${encodeURIComponent(customerParam)}&page=${page}&per_page=5&orderby=date&order=desc`,
      ),
    enabled: Boolean(customerParam),
  })
  useQueryErrorToast(listQ)

  const h = history ?? { order_count: 0, total_spent: 0, avg_order_value: 0 }
  const items = listQ.data?.items ?? []
  const found = listQ.data?.found ?? h.order_count

  return (
    <OrderSidebarPanel title={t('orders.panelCustomerHistory')} defaultOpen={false}>
      {isGuest && !customerParam ? (
        <p className="text-muted-foreground text-sm">{t('orders.guestCustomer')}</p>
      ) : (
        <div className="space-y-4">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">{t('orders.historyOrders')}</dt>
              <dd className="font-semibold">{formatNumber(h.order_count || found, locale)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">{t('orders.historyRevenue')}</dt>
              <dd className="font-semibold">
                <MoneyDisplay
                  amount={h.total_spent}
                  currency={displayCurrency}
                  currencySymbol={store.currencySymbol}
                  locale={locale}
                />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">{t('orders.historyAov')}</dt>
              <dd className="font-semibold">
                <MoneyDisplay
                  amount={h.avg_order_value}
                  currency={displayCurrency}
                  currencySymbol={store.currencySymbol}
                  locale={locale}
                />
              </dd>
            </div>
          </dl>
          {customerParam ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('orders.customerOrdersList')}</p>
              <ul className="space-y-2">
                {items.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <Link
                        to={`/orders/list/${row.id}`}
                        className={`text-primary font-medium hover:underline ${row.id === currentOrderId ? 'opacity-60' : ''}`}
                      >
                        #{localizeDigits(row.number, locale)}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {formatDisplayDateTime(row.date ?? undefined, locale)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{translateOrderStatus(t, row.status)}</Badge>
                      <MoneyDisplay
                        amount={parseFloat(row.total || '0')}
                        currency={row.currency || displayCurrency}
                        currencySymbol={store.currencySymbol}
                        locale={locale}
                      />
                    </div>
                  </li>
                ))}
                {!listQ.isLoading && items.length === 0 ? (
                  <li className="text-muted-foreground text-xs">{t('orders.emptyHint')}</li>
                ) : null}
              </ul>
              {found > 5 ? (
                <PostsPagination
                  page={page}
                  perPage={5}
                  found={found}
                  onPageChange={setPage}
                  onPerPageChange={() => undefined}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </OrderSidebarPanel>
  )
}
