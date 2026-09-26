import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { OrderDocumentsSettings } from '@/components/settings/OrderDocumentsSettingsPanel'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  const secondary = [
    enablePacking
      ? { type: 'packing' as const, label: t('orders.printPacking') }
      : null,
    enableCustomer
      ? { type: 'customer_label' as const, label: t('orders.printCustomerLabel') }
      : null,
    enableStore
      ? { type: 'store_label' as const, label: t('orders.printStoreLabel') }
      : null,
  ].filter(Boolean) as { type: 'packing' | 'customer_label' | 'store_label'; label: string }[]

  if (!enableInvoice && !enableLabel && !enableReceipt && !secondary.length) return null

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
      {secondary.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Printer className="size-4" aria-hidden />
              {t('orders.printMore')}
              <ChevronDown className="size-3.5 opacity-70" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {secondary.map((item) => (
              <DropdownMenuItem key={item.type} onSelect={() => openOrderPrint(orderId, item.type)}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
