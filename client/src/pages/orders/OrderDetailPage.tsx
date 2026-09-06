import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useMatch, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastApiError, ApiError } from '@/lib/apiError'

import { MarketplaceBadge } from '@/components/data/MarketplaceBadge'
import { DigikalaOrderActions, digikalaWooStatusAllowed } from '@/components/orders/DigikalaOrderActions'
import { OrderAddressBlock, type OrderAddress } from '@/components/orders/OrderAddressBlock'
import { QueryErrorState } from '@/components/QueryErrorState'
import { OrderAttributionPanel, type OrderAttribution } from '@/components/orders/OrderAttributionPanel'
import { OrderCustomerContactBar } from '@/components/orders/OrderCustomerContactBar'
import { OrderCustomerHistoryPanel } from '@/components/orders/OrderCustomerHistoryPanel'
import { OrderCustomerProfilePanel } from '@/components/orders/OrderCustomerProfilePanel'
import { OrderNotesPanel, type OrderNote } from '@/components/orders/OrderNotesPanel'
import { OrderPrintActions } from '@/components/orders/OrderPrintActions'
import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { OrderReturnsPanel } from '@/components/orders/OrderReturnsPanel'
import { OrderSmsHistoryPanel, type SmsLogEntry } from '@/components/orders/OrderSmsHistoryPanel'
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
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { normalizeCapabilities } from '@/lib/bootstrapQuery'
import { formatDisplayDateTime } from '@/lib/date'
import { translateOrderStatus } from '@/lib/enumLabels'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { MobileListCard } from '@/components/MobileListCard'
import { LazyImage } from '@/components/ui/lazy-image'
import { localizeDigits } from '@/lib/digits'
import { formatNumber } from '@/lib/formatNumber'
import { notifyOrderSms } from '@/lib/modirpayamak-api'
import type { TFunction } from 'i18next'

type LineItem = {
  item_id?: number
  name: string
  quantity: number
  returnable_qty?: number
  subtotal: string
  total: string
  sku?: string
  product_id?: number
  variation_id?: number
  image?: string
  attributes?: { key: string; value: string }[]
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
  shipping_items?: { name: string; total: string; id?: string }[]
  shipping_method_options?: { id: string; title: string }[]
  tracking_code?: string
  tracking_url?: string
  tracking_provider?: string
  post_barcode?: string
  delivery_date?: string
  delivery_time?: string
  national_id?: string
  checkout_phone?: string
  sms_log?: SmsLogEntry[]
  payment_gateway_meta?: {
    transaction_id?: string
    type?: string
    tracking_code?: string
    provider_id?: string
    gateway?: string
    delivered?: string
  }
  attribution?: OrderAttribution
  marketplace?: string
  remote_order_id?: string
  remote_status?: string
  digikala_fulfillment?: string
  digikala_shipment_id?: string
  digikala_native_status?: string
  notes?: OrderNote[]
  customer_history?: { order_count: number; total_spent: number; avg_order_value: number }
  date_created?: string | null
  date_modified?: string | null
  billing?: OrderAddress
  shipping?: OrderAddress
  billing_formatted?: OrderAddress
  shipping_formatted?: OrderAddress
  items: LineItem[]
  returns?: Array<{
    id: number
    order_item_id: number
    item_name: string
    qty: number
    reason: string
    status: string
    status_label: string
    resolution: string
    exchange_order_id?: number
  }>
  return_eligible?: boolean
  return_address?: string
  is_pos?: boolean
  sales_channel?: string
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

function paymentBadgeVariant(method: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const m = method.toLowerCase()
  if (m === 'cod') return 'secondary'
  if (m === 'bacs' || m === 'cheque') return 'outline'
  if (m.includes('digipay') || m.includes('zarin') || m.includes('snapp') || m.includes('pay')) {
    return 'default'
  }
  return method ? 'default' : 'outline'
}

const HIDDEN_ITEM_META = new Set(['_reduced_stock', 'reduced_stock', 'wfcp_gateway'])

function formatOrderItemMetaKey(t: TFunction, key: string): string {
  const slug = key.replace(/^_/, '')
  if (slug === 'wfcp_purchase_type' || key === 'wfcp_purchase_type') {
    return t('orders.itemMeta.wfcp_purchase_type')
  }
  const i18nKey = `orders.itemMeta.${slug}`
  const translated = t(i18nKey)
  return translated === i18nKey ? key : translated
}

function formatOrderItemMetaValue(
  t: TFunction,
  key: string,
  value: string,
  currency?: string,
): string {
  const slug = key.replace(/^_/, '')
  if (slug === 'wfcp_purchase_type' || key === 'wfcp_purchase_type') {
    const typeKey = `orders.purchaseType.${value.trim().toLowerCase()}`
    const translated = t(typeKey)
    return translated === typeKey ? value : translated
  }
  if (slug === 'wfcp_installment_months') {
    const months = parseInt(value, 10)
    if (!Number.isNaN(months) && months > 0) {
      return t('orders.installmentMonths', { count: months })
    }
  }
  if (slug === 'wfcp_installment_total') {
    const amount = parseFloat(value.replace(/[^\d.-]/g, ''))
    if (!Number.isNaN(amount) && amount > 0 && currency) {
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
      } catch {
        return value
      }
    }
  }
  return value
}

function visibleItemAttributes(
  attrs: { key: string; value: string }[] | undefined,
  canManageOrders: boolean,
) {
  if (!attrs?.length) return []
  return attrs.filter((a) => {
    const k = (a.key || '').trim()
    if (!k) return false
    const slug = k.replace(/^_/, '')
    if (HIDDEN_ITEM_META.has(k) || HIDDEN_ITEM_META.has(slug)) {
      return canManageOrders && slug === 'wfcp_gateway'
    }
    if (k.startsWith('_')) return false
    return true
  })
}

function addressesEqual(a?: OrderAddress | null, b?: OrderAddress | null): boolean {
  if (!a || !b) return false
  const norm = (x: OrderAddress) =>
    [x.name, x.state_label || x.state, x.city, x.address_1, x.postcode]
      .map((v) => (v || '').trim().toLowerCase())
      .join('|')
  return norm(a) === norm(b) && Boolean(norm(a))
}

export default function OrderDetailPage() {
  const { t, i18n } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const id = orderId ? parseInt(orderId, 10) : 0
  const qc = useQueryClient()
  const store = useStoreCurrency()
  const locale = i18n.language
  const boot = useBootstrapQuery()
  const canManageOrders = normalizeCapabilities(boot.data?.capabilities).includes('edit_shop_orders')
  const canCreateOrders =
    canManageOrders ||
    normalizeCapabilities(boot.data?.capabilities).includes('webino_create_shop_orders')
  const canAccounting =
    normalizeCapabilities(boot.data?.capabilities).includes('manage_woocommerce') ||
    normalizeCapabilities(boot.data?.capabilities).includes('webino_manage_accounting') ||
    normalizeCapabilities(boot.data?.capabilities).includes('manage_options')
  const listHref = useMatch('/account/orders/:orderId') ? '/account/orders' : '/orders/list'
  const isPortalOrder = Boolean(useMatch('/account/orders/:orderId'))
  const [status, setStatus] = useState('')
  const [bots, setBots] = useState<
    { bale?: { connected?: boolean; username?: string }; telegram?: { connected?: boolean; username?: string } } | undefined
  >()

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

  const sendSms = useMutation({
    mutationFn: (opts: { force_customer?: boolean; force_admin?: boolean }) =>
      notifyOrderSms({
        order_id: id,
        force_customer: opts.force_customer,
        force_admin: opts.force_admin,
      }),
    onSuccess: () => {
      toast.success(t('orders.sms.sent'))
      void qc.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const syncMoadian = useMutation({
    mutationFn: () => apiFetch(`accounting/sync/order/${id}`, { method: 'POST' }),
    onSuccess: () => {
      toast.success(t('orders.moadianSynced'))
      void qc.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  function applyStatus() {
    if (!status || status === order?.status) {
      return
    }
    if (order?.marketplace === 'digikala') {
      const blocked = digikalaWooStatusAllowed(order, status)
      if (blocked) {
        toast.error(t(blocked))
        return
      }
      if (status === 'cancelled') {
        void apiFetch(`digikala/orders/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cancellation_reason_id: -1 }),
        })
          .then(() => patch.mutateAsync('cancelled'))
          .catch((e: Error) => toastApiError(t, e))
        return
      }
      if (order.digikala_fulfillment === 'seller' && (status === 'processing' || status === 'completed')) {
        const action = status === 'completed' ? 'full_delivered_to_customer' : 'processing'
        void apiFetch(`digikala/orders/${id}/sbs-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
          .then(() => {
            toast.success(t('digikala.statusPushed'))
            return patch.mutateAsync(status)
          })
          .catch((e: Error) => toastApiError(t, e))
        return
      }
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
  const sameAddress = useMemo(() => addressesEqual(billingAddr, shippingAddr), [billingAddr, shippingAddr])
  const phone = order?.checkout_phone || billingAddr?.phone || order?.billing?.phone || ''
  const shippingTotal = order?.shipping_total != null ? parseFloat(order.shipping_total) : NaN
  const shippingFree = !Number.isNaN(shippingTotal) && shippingTotal <= 0

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
                  {order.is_pos ? <Badge variant="outline">{t('pos.badge')}</Badge> : null}
                  {order.sales_channel ? (
                    <Badge variant="secondary">{t(`pos.channel.${order.sales_channel}`, { defaultValue: order.sales_channel })}</Badge>
                  ) : null}
                  {order.marketplace ? <MarketplaceBadge slug={order.marketplace} /> : null}
                  {order.payment_method || order.payment_method_title ? (
                    <Badge variant={paymentBadgeVariant(order.payment_method || '')}>{paymentTitle}</Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  {order.customer_ip ? (
                    <span>
                      {t('orders.customerIp')}: <code className="text-xs">{order.customer_ip}</code>
                    </span>
                  ) : null}
                </p>
                <OrderCustomerContactBar
                  phone={phone}
                  email={billingAddr?.email || order.billing?.email}
                  customerId={order.customer_id}
                  isGuest={order.is_guest}
                  bots={bots}
                  onSms={() => sendSms.mutate({ force_customer: true })}
                />
                {!order.is_editable ? (
                  <p className="text-muted-foreground text-sm">{t('orders.notEditable')}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <OrderPrintActions orderId={order.id} />
                <div className="flex flex-wrap gap-2">
                  {canCreateOrders && order.is_editable ? (
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link to={`/orders/list/${order.id}/edit`}>{t('orders.editOrder')}</Link>
                    </Button>
                  ) : null}
                  {canAccounting ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={syncMoadian.isPending}
                      onClick={() => void syncMoadian.mutateAsync()}
                    >
                      {t('orders.moadianSync')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {sameAddress ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('orders.sectionAddress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAddressBlock address={shippingAddr || billingAddr} showEmail />
                {order.checkout_phone ? (
                  <p className="text-muted-foreground mt-3 text-xs">
                    {t('orders.checkoutPhone')}: {localizeDigits(order.checkout_phone, locale)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : (
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
          )}

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
            <div className="min-w-0 space-y-6">
              <Card className="min-w-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('orders.sectionGeneral')}</CardTitle>
                </CardHeader>
                <CardContent className="min-w-0 space-y-4">
                  <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-muted-foreground text-xs">{t('orders.orderDate')}</dt>
                      <dd className="break-words text-sm">{formatDisplayDateTime(order.date_created ?? undefined, locale)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted-foreground text-xs">{t('orders.customer')}</dt>
                      <dd className="break-words text-sm">
                        {order.is_guest
                          ? t('orders.guestCustomer')
                          : order.billing?.email || t('common.emptyValue')}
                      </dd>
                    </div>
                    {order.shipping_method ? (
                      <div className="min-w-0">
                        <dt className="text-muted-foreground text-xs">{t('orders.shippingMethod')}</dt>
                        <dd className="break-words text-sm">{order.shipping_method}</dd>
                      </div>
                    ) : null}
                    {order.national_id ? (
                      <div className="min-w-0">
                        <dt className="text-muted-foreground text-xs">{t('orders.nationalId')}</dt>
                        <dd className="break-all text-sm">{localizeDigits(order.national_id, locale)}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {canManageOrders ? (
                    <>
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
                              {translateOrderStatus(t, s.slug, s.label)}
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

                  {order.marketplace === 'digikala' ? (
                    <DigikalaOrderActions orderId={order.id} order={order} onDone={invalidateOrder} />
                  ) : null}

                  <Separator />

                  <div className="space-y-2">
                    <Label>{t('orders.sms.title')}</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={sendSms.isPending}
                        onClick={() => sendSms.mutate({ force_customer: true })}
                      >
                        {t('orders.sms.sendCustomer')}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={sendSms.isPending}
                        onClick={() => sendSms.mutate({ force_admin: true })}
                      >
                        {t('orders.sms.sendAdmin')}
                      </Button>
                    </div>
                  </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="min-w-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('orders.itemsDetail')}</CardTitle>
                </CardHeader>
                <CardContent className="min-w-0 p-3 sm:p-6">
                  <div className="space-y-3 md:hidden">
                    {order.items.map((it, i) => {
                      const href =
                        it.product_id && it.product_id > 0 ? `/shop/products/${it.product_id}` : ''
                      const attrs = visibleItemAttributes(it.attributes, canManageOrders)
                      return (
                        <MobileListCard
                          key={`${it.product_id}-${it.variation_id}-${i}`}
                          media={
                            <div className="flex gap-3">
                              {it.image ? (
                                <LazyImage
                                  src={it.image}
                                  alt={it.name}
                                  className="size-14 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="bg-muted size-14 shrink-0 rounded-lg" />
                              )}
                              <div className="min-w-0 flex-1 space-y-1">
                                {href ? (
                                  <Link to={href} className="text-primary break-words font-medium hover:underline">
                                    {it.name}
                                  </Link>
                                ) : (
                                  <span className="break-words font-medium">{it.name}</span>
                                )}
                                <p className="text-muted-foreground text-xs">
                                  × {formatNumber(it.quantity, locale)}
                                  {it.sku ? ` · ${it.sku}` : ''}
                                </p>
                                {attrs.length ? (
                                  <ul className="text-muted-foreground space-y-0.5 text-xs">
                                    {attrs.map((a) => (
                                      <li key={`${a.key}-${a.value}`} className="break-words">
                                        {formatOrderItemMetaKey(t, a.key)}:{' '}
                                        {formatOrderItemMetaValue(t, a.key, a.value, order.currency)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </div>
                          }
                        >
                          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                            <div>
                              <dt className="text-muted-foreground text-xs">{t('orders.colSubtotal')}</dt>
                              <dd>
                                <MoneyDisplay
                                  amount={parseFloat(it.subtotal || it.total)}
                                  currency={order.currency}
                                  currencySymbol={store.currencySymbol}
                                  locale={locale}
                                />
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground text-xs">{t('orders.colTotalLine')}</dt>
                              <dd className="font-medium">
                                <MoneyDisplay
                                  amount={parseFloat(it.total)}
                                  currency={order.currency}
                                  currencySymbol={store.currencySymbol}
                                  locale={locale}
                                />
                              </dd>
                            </div>
                          </dl>
                        </MobileListCard>
                      )
                    })}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14" />
                          <TableHead>{t('products.fieldName')}</TableHead>
                          <TableHead>{t('orders.colSku')}</TableHead>
                          <TableHead className="text-end">{t('orders.colSubtotal')}</TableHead>
                          <TableHead className="text-end">{t('orders.colTotalLine')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((it, i) => {
                          const href =
                            it.product_id && it.product_id > 0 ? `/shop/products/${it.product_id}` : ''
                          return (
                            <TableRow key={`${it.product_id}-${it.variation_id}-${i}`}>
                              <TableCell>
                                {it.image ? (
                                  <LazyImage
                                    src={it.image}
                                    alt={it.name}
                                    className="size-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="bg-muted size-10 rounded" />
                                )}
                              </TableCell>
                              <TableCell>
                                {href ? (
                                  <Link to={href} className="text-primary font-medium hover:underline">
                                    {it.name}
                                  </Link>
                                ) : (
                                  <span className="font-medium">{it.name}</span>
                                )}
                                <span className="text-muted-foreground ms-2">
                                  × {formatNumber(it.quantity, locale)}
                                </span>
                                {(() => {
                                  const attrs = visibleItemAttributes(it.attributes, canManageOrders)
                                  if (!attrs.length) return null
                                  return (
                                    <ul className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                                      {attrs.map((a) => (
                                        <li key={`${a.key}-${a.value}`}>
                                          {formatOrderItemMetaKey(t, a.key)}:{' '}
                                          {formatOrderItemMetaValue(t, a.key, a.value, order.currency)}
                                        </li>
                                      ))}
                                    </ul>
                                  )
                                })()}
                              </TableCell>
                              <TableCell className="text-sm">{it.sku || '—'}</TableCell>
                              <TableCell className="text-end">
                                <MoneyDisplay
                                  amount={parseFloat(it.subtotal || it.total)}
                                  currency={order.currency}
                                  currencySymbol={store.currencySymbol}
                                  locale={locale}
                                />
                              </TableCell>
                              <TableCell className="text-end font-medium">
                                <MoneyDisplay
                                  amount={parseFloat(it.total)}
                                  currency={order.currency}
                                  currencySymbol={store.currencySymbol}
                                  locale={locale}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {(canManageOrders || isPortalOrder) && (order.return_eligible || (order.returns?.length ?? 0) > 0) ? (
                <OrderReturnsPanel
                  orderId={order.id}
                  items={order.items}
                  returns={order.returns ?? []}
                  returnEligible={order.return_eligible}
                  returnAddress={order.return_address}
                  staffMode={canManageOrders}
                  orderBasePath={isPortalOrder ? '/account/orders' : '/orders/list'}
                />
              ) : null}

              <Card className="min-w-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('orders.sectionTotals')}</CardTitle>
                </CardHeader>
                <CardContent className="min-w-0 space-y-2 text-sm">
                  {order.subtotal != null ? (
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <span className="text-muted-foreground shrink-0">{t('orders.subtotalOrder')}</span>
                      <span className="min-w-0 text-end">
                        <MoneyDisplay
                          amount={parseFloat(order.subtotal)}
                          currency={order.currency}
                          currencySymbol={store.currencySymbol}
                          locale={locale}
                        />
                      </span>
                    </div>
                  ) : null}
                  {(order.shipping_items ?? []).map((si, idx) => {
                    const amt = parseFloat(si.total || '0')
                    return (
                      <div key={`${si.name}-${idx}`} className="flex min-w-0 items-start justify-between gap-3">
                        <span className="text-muted-foreground min-w-0 break-words">
                          {si.name || t('orders.shippingLine')}
                        </span>
                        {amt <= 0 ? (
                          <span className="shrink-0">{t('orders.shippingFree')}</span>
                        ) : (
                          <span className="min-w-0 shrink-0 text-end">
                            <MoneyDisplay
                              amount={amt}
                              currency={order.currency}
                              currencySymbol={store.currencySymbol}
                              locale={locale}
                            />
                          </span>
                        )}
                      </div>
                    )
                  })}
                  {(!order.shipping_items || order.shipping_items.length === 0) && order.shipping_total != null ? (
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <span className="text-muted-foreground shrink-0">{t('orders.shippingLine')}</span>
                      {shippingFree ? (
                        <span className="shrink-0">{t('orders.shippingFree')}</span>
                      ) : (
                        <span className="min-w-0 shrink-0 text-end">
                          <MoneyDisplay
                            amount={shippingTotal}
                            currency={order.currency}
                            currencySymbol={store.currencySymbol}
                            locale={locale}
                          />
                        </span>
                      )}
                    </div>
                  ) : null}
                  {order.total_discount != null && parseFloat(order.total_discount) > 0 ? (
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <span className="text-muted-foreground shrink-0">{t('orders.discount')}</span>
                      <span className="min-w-0 text-end">
                        <MoneyDisplay
                          amount={parseFloat(order.total_discount)}
                          currency={order.currency}
                          currencySymbol={store.currencySymbol}
                          locale={locale}
                          prefix={<span>-</span>}
                        />
                      </span>
                    </div>
                  ) : null}
                  <Separator />
                  <div className="flex min-w-0 items-start justify-between gap-3 text-base font-semibold">
                    <span className="shrink-0">{t('orders.total')}</span>
                    <span className="min-w-0 text-end">
                      <MoneyDisplay
                        amount={parseFloat(order.total)}
                        currency={order.currency}
                        currencySymbol={store.currencySymbol}
                        locale={locale}
                      />
                    </span>
                  </div>
                  {order.customer_note ? (
                    <div className="bg-muted/40 mt-4 rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs font-medium">{t('orders.customerNote')}</p>
                      <p className="mt-1 break-words whitespace-pre-wrap">{order.customer_note}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {canManageOrders ? (
                <OrderCustomerProfilePanel
                  customerId={order.customer_id}
                  locale={locale}
                  nationalIdFromOrder={order.national_id}
                  onBots={setBots}
                />
              ) : null}
            </div>

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
              {canManageOrders ? (
                <OrderNotesPanel
                  orderId={order.id}
                  notes={order.notes ?? []}
                  locale={locale}
                  onChanged={invalidateOrder}
                />
              ) : null}
              <OrderCustomerHistoryPanel
                history={order.customer_history}
                currency={order.currency}
                locale={locale}
                isGuest={order.is_guest}
                customerId={order.customer_id}
                customerEmail={order.billing?.email}
                customerPhone={phone}
                currentOrderId={order.id}
              />
              {canManageOrders ? (
                <>
                  <OrderSmsHistoryPanel entries={order.sms_log} locale={locale} />
                  <OrderTrackingPanel
                    orderId={order.id}
                    trackingCode={order.tracking_code}
                    trackingUrl={order.tracking_url}
                    trackingProvider={order.tracking_provider}
                    deliveryDate={order.delivery_date}
                    deliveryTime={order.delivery_time}
                    postBarcode={order.post_barcode}
                    shippingOptions={order.shipping_method_options}
                    onSaved={invalidateOrder}
                  />
                </>
              ) : null}

              {digipay?.transaction_id || digipay?.type || digipay?.tracking_code || digipay?.provider_id ? (
                <OrderSidebarPanel title={t('orders.panelDigipay')} defaultOpen={false}>
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

              {order.marketplace ? (
                <OrderSidebarPanel title={t('orders.marketplaceTitle')} defaultOpen={false}>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('orders.marketplacePlatform')}</dt>
                      <dd>
                        <MarketplaceBadge slug={order.marketplace} />
                      </dd>
                    </div>
                    {order.remote_order_id ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.marketplaceRemoteId')}</dt>
                        <dd>{order.remote_order_id}</dd>
                      </div>
                    ) : null}
                    {order.remote_status ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">{t('orders.marketplaceRemoteStatus')}</dt>
                        <dd>{order.remote_status}</dd>
                      </div>
                    ) : null}
                  </dl>
                </OrderSidebarPanel>
              ) : null}

              <OrderAttributionPanel attribution={order.attribution} />
            </aside>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="text-muted-foreground pt-6 text-sm">
            <p className="mb-3">{t('orders.detailNotFound')}</p>
            <Button asChild variant="outline" size="sm">
              <Link to={listHref}>{t('orders.title')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
