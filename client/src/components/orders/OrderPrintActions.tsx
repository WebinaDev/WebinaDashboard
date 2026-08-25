import { useQuery } from '@tanstack/react-query'
import { Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { OrderDocumentsSettings } from '@/components/settings/OrderDocumentsSettingsPanel'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { openOrderPrint } from '@/lib/orderPrint'

type OrderPrintActionsProps = {
  orderId: number
}

export function OrderPrintActions({ orderId }: OrderPrintActionsProps) {
  const { t } = useTranslation()
  const docs = useQuery({
    queryKey: ['shop-settings', 'invoices'],
    queryFn: () => apiFetch<OrderDocumentsSettings>('shop/settings/invoices'),
    staleTime: 60_000,
  })
  const enableInvoice = docs.data?.enable_invoice !== false
  const enableLabel = docs.data?.enable_label !== false
  const enableReceipt = docs.data?.enable_receipt !== false
  const enablePacking = docs.data?.enable_packing !== false
  const enableCustomer = docs.data?.enable_customer_label !== false
  const enableStore = docs.data?.enable_store_label !== false

  if (!enableInvoice && !enableLabel && !enableReceipt && !enablePacking && !enableCustomer && !enableStore) return null

  return (
    <div className="flex flex-wrap gap-2">
      {enableInvoice ? (
        <Button type="button" variant="outline" size="sm" onClick={() => openOrderPrint(orderId, 'invoice')}>
          <Printer className="size-4" aria-hidden />
          {t('orders.printInvoice')}
        </Button>
      ) : null}
      {enableLabel ? (
        <Button type="button" variant="outline" size="sm" onClick={() => openOrderPrint(orderId, 'label')}>
          <Printer className="size-4" aria-hidden />
          {t('orders.printLabel')}
        </Button>
      ) : null}
      {enableReceipt ? (
        <Button type="button" variant="outline" size="sm" onClick={() => openOrderPrint(orderId, 'receipt')}>
          <Printer className="size-4" aria-hidden />
          {t('orders.printReceipt')}
        </Button>
      ) : null}
      {enablePacking ? (
        <Button type="button" variant="outline" size="sm" onClick={() => openOrderPrint(orderId, 'packing')}>
          <Printer className="size-4" aria-hidden />
          {t('orders.printPacking')}
        </Button>
      ) : null}
      {enableCustomer ? (
        <Button type="button" variant="outline" size="sm" onClick={() => openOrderPrint(orderId, 'customer_label')}>
          <Printer className="size-4" aria-hidden />
          {t('orders.printCustomerLabel')}
        </Button>
      ) : null}
      {enableStore ? (
        <Button type="button" variant="outline" size="sm" onClick={() => openOrderPrint(orderId, 'store_label')}>
          <Printer className="size-4" aria-hidden />
          {t('orders.printStoreLabel')}
        </Button>
      ) : null}
    </div>
  )
}
