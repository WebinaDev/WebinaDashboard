import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError, ApiError } from '@/lib/apiError'

import { OrderAddressBlock, type OrderAddress } from '@/components/orders/OrderAddressBlock'
import { QueryErrorState } from '@/components/QueryErrorState'
import { OrderAttributionPanel, type OrderAttribution } from '@/components/orders/OrderAttributionPanel'
import { OrderCustomerHistoryPanel } from '@/components/orders/OrderCustomerHistoryPanel'
import { OrderNotesPanel, type OrderNote } from '@/components/orders/OrderNotesPanel'
import { OrderPrintActions } from '@/components/orders/OrderPrintActions'
import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { OrderTrackingPanel } from '@/components/orders/OrderTrackingPanel'
import { DetailTwoColumnSkeleton } from '@/components/skeletons'
import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { translateOrderStatus } from '@/lib/enumLabels'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { localizeDigits } from '@/lib/digits'
import { formatNumber } from '@/lib/formatNumber'

type LineItem = {
  name: string
  quantity: number
  subtotal: string
  total: string
  sku?: string
  product_id?: number
  variation_id?: number
}

type Order = {
  id: number
  number?: string
  status: string
  status_label?: string
  total: string
  subtotal?: string
  total_discount?: string
  shipping_total?: string
  currency: string
  payment_method?: string
  payment_method_title?: string
  customer_note?: string
  customer_id?: number
  is_guest?: boolean
  customer_ip?: string
  is_editable?: boolean
  shipping_method?: string
  shipping_items?: { name: string; total: string }[]
  tracking_code?: string
  tracking_url?: string
  tracking_provider?: string
  delivery_date?: string
  delivery_time?: string
  national_id?: string
  checkout_phone?: string
  payment_gateway_meta?: {
    transaction_id?: string
    type?: string
    tracking_code?: string
    provider_id?: string
    gateway?: string
    delivered?: string
  }
  attribution?: OrderAttribution
  notes?: OrderNote[]
  customer_history?: { order_count: number; total_spent: number; avg_order_value: number }
  date_created?: string | null
  date_modified?: string | null
  billing?: OrderAddress
  shipping?: OrderAddress
  billing_formatted?: OrderAddress
  shipping_formatted?: OrderAddress
  items: LineItem[]
}

type StatusOption = { slug: string; label: string }

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

export default function OrderDetailPage() {
  const { t, i18n } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const id = orderId ? parseInt(orderId, 10) : 0
  const qc = useQueryClient()
  const locale = i18n.language
  const [status, setStatus] = useState('')

  const q = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiFetch<Order>(`orders/${id}`),
    enabled: id > 0,
  })
  useQueryErrorToast(q)

  const statusesQ = useQuery({
    queryKey: ['orders', 'statuses'],
    queryFn: () => apiFetch<{ items: StatusOption[] }>('shop/orders/statuses'),
  })

  useEffect(() => {
    if (q.data?.status) setStatus(q.data.status)
  }, [q.data?.status])

  const patch = useMutation({
    mutationFn: (nextStatus: string) =>
      apiFetch(`orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['order', id] })
      void qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => {
      if (q.data?.status) {
        setStatus(q.data.status)
      }
      toastApiError(t, e)
    },
  })

  function applyStatus() {
    if (!status || status === order?.status) {
      return
    }
    void patch.mutateAsync(status)
  }

  function invalidateOrder() {
    void qc.invalidateQueries({ queryKey: ['order', id] })
    void qc.invalidateQueries({ queryKey: ['orders'] })
  }

  const order = q.data
  const statuses = statusesQ.data?.items ?? []
  const isNotFound =
    q.isError &&
    q.error instanceof ApiError &&
    (q.error.status === 404 || q.error.code === 'not_found')
  const paymentTitle = order?.payment_method_title || order?.payment_method || t('common.emptyValue')
  const digipay = order?.payment_gateway_meta
  const billingAddr = order?.billing_formatted ?? order?.billing
  const shippingAddr = order?.shipping_formatted ?? order?.shipping

  return (
    <PageShell
      title={
        order?.number
          ? t('orders.detailTitleNumber', { number: localizeDigits(order.number, locale) })
          : t('orders.detailTitle', { id: formatNumber(order?.id ?? 0, locale) })
      }
    >
      {q.isLoading ? (
        <DetailTwoColumnSkeleton />
      ) : q.isError && !isNotFound ? (
        <QueryErrorState onRetry={() => void q.refetch()} />
      ) : order ? (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    #{localizeDigits(String(order.number ?? order.id), locale)}
                  </h2>
                  <Badge variant={statusBadgeVariant(order.status)}>{translateOrderStatus(t, order.status)}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t('orders.paidVia', { method: paymentTitle })}
                  {order.customer_ip ? (
                    <span>
                      {' '}
                      · {t('orders.customerIp')}: <code className="text-xs">{order.customer_ip}</code>
                    </span>
                  ) : null}
                </p>
                {!order.is_editable ? (
                  <p className="text-muted-foreground text-sm">{t('orders.notEditable')}</p>
                ) : null}
              </div>
              <OrderPrintActions orderId={order.id} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('orders.sectionBilling')}</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAddressBlock address={billingAddr} showEmail />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('orders.sectionShipping')}</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAddressBlock address={shippingAddr} showEmail={false} />
                {order.checkout_phone ? (
                  <p className="text-muted-foreground mt-3 text-xs">
                    {t('orders.checkoutPhone')}: {localizeDigits(order.checkout_phone, locale)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('orders.sectionGeneral')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('orders.orderDate')}</dt>
                      <dd className="text-sm">{formatDisplayDateTime(order.date_created ?? undefined, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('orders.customer')}</dt>
                      <dd className="text-sm">
                        {order.is_guest
                          ? t('orders.guestCustomer')
                          : order.billing?.email || t('common.emptyValue')}
                      </dd>
                    </div>
                    {order.shipping_method ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.shippingMethod')}</dt>
                        <dd className="text-sm">{order.shipping_method}</dd>
                      </div>
                    ) : null}
                    {order.national_id ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.nationalId')}</dt>
                        <dd className="font-mono text-sm">{localizeDigits(order.national_id, locale)}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <Separator />

                  <div className="space-y-2">
                    <Label>{t('orders.newStatus')}</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={status || order.status}
                        onValueChange={setStatus}
                        disabled={patch.isPending}
                      >
                        <SelectTrigger className="w-[min(100%,220px)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(statuses.length
                            ? statuses
                            : [{ slug: order.status, label: translateOrderStatus(t, order.status) }]
                          ).map((s) => (
                            <SelectItem key={s.slug} value={s.slug}>
                              {translateOrderStatus(t, s.slug) !== s.slug
                                ? translateOrderStatus(t, s.slug)
                                : s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={patch.isPending || !status || status === order.status}
                        onClick={applyStatus}
                      >
                        {t('orders.applyStatus')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('orders.itemsDetail')}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0 sm:p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('products.fieldName')}</TableHead>
                        <TableHead>{t('orders.colSku')}</TableHead>
                        <TableHead className="text-end">{t('orders.colSubtotal')}</TableHead>
                        <TableHead className="text-end">{t('orders.colTotalLine')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((it, i) => (
                        <TableRow key={`${it.product_id}-${it.variation_id}-${i}`}>
                          <TableCell>
                            <span className="font-medium">{it.name}</span>
                            <span className="text-muted-foreground ms-2">× {formatNumber(it.quantity, locale)}</span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{it.sku || '—'}</TableCell>
                          <TableCell className="text-end">
                            {formatNumber(parseFloat(it.subtotal || it.total), locale)}
                          </TableCell>
                          <TableCell className="text-end font-medium">
                            {formatNumber(parseFloat(it.total), locale)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('orders.sectionTotals')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {order.subtotal != null ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('orders.subtotalOrder')}</span>
                      <MoneyDisplay amount={parseFloat(order.subtotal)} currency={order.currency} locale={locale} />
                    </div>
                  ) : null}
                  {order.shipping_total != null ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('orders.shippingLine')}</span>
                      <MoneyDisplay amount={parseFloat(order.shipping_total)} currency={order.currency} locale={locale} />
                    </div>
                  ) : null}
                  {order.total_discount != null && parseFloat(order.total_discount) > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('orders.discount')}</span>
                      <MoneyDisplay
                        amount={parseFloat(order.total_discount)}
                        currency={order.currency}
                        locale={locale}
                        prefix={<span>-</span>}
                      />
                    </div>
                  ) : null}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>{t('orders.total')}</span>
                    <MoneyDisplay amount={parseFloat(order.total)} currency={order.currency} locale={locale} />
                  </div>
                  {order.customer_note ? (
                    <div className="bg-muted/40 mt-4 rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs font-medium">{t('orders.customerNote')}</p>
                      <p className="mt-1 whitespace-pre-wrap">{order.customer_note}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-4">
              <OrderTrackingPanel
                orderId={order.id}
                trackingCode={order.tracking_code}
                trackingUrl={order.tracking_url}
                trackingProvider={order.tracking_provider}
                deliveryDate={order.delivery_date}
                deliveryTime={order.delivery_time}
                onSaved={invalidateOrder}
              />

              {digipay?.transaction_id || digipay?.type || digipay?.tracking_code || digipay?.provider_id ? (
                <OrderSidebarPanel title={t('orders.panelDigipay')}>
                  <dl className="space-y-2 text-sm">
                    {digipay.transaction_id ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.digipayTransaction')}</dt>
                        <dd className="font-mono text-sm">{digipay.transaction_id}</dd>
                      </div>
                    ) : null}
                    {digipay.type ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.digipayType')}</dt>
                        <dd>{digipay.type}</dd>
                      </div>
                    ) : null}
                    {digipay.tracking_code ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.digipayTrackingCode')}</dt>
                        <dd className="font-mono text-sm">{digipay.tracking_code}</dd>
                      </div>
                    ) : null}
                    {digipay.provider_id ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.digipayProviderId')}</dt>
                        <dd className="font-mono text-sm">{digipay.provider_id}</dd>
                      </div>
                    ) : null}
                    {digipay.gateway ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.digipayGateway')}</dt>
                        <dd>{digipay.gateway}</dd>
                      </div>
                    ) : null}
                    {digipay.delivered ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.digipayDelivered')}</dt>
                        <dd>{digipay.delivered}</dd>
                      </div>
                    ) : null}
                  </dl>
                </OrderSidebarPanel>
              ) : null}

              <OrderAttributionPanel attribution={order.attribution} />
              <OrderNotesPanel
                orderId={order.id}
                notes={order.notes ?? []}
                locale={locale}
                onChanged={invalidateOrder}
              />
              <OrderCustomerHistoryPanel
                history={order.customer_history}
                currency={order.currency}
                locale={locale}
                isGuest={order.is_guest}
              />
            </aside>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="text-muted-foreground pt-6 text-sm">
            <p className="mb-3">{t('orders.detailNotFound')}</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/orders/list">{t('orders.title')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
