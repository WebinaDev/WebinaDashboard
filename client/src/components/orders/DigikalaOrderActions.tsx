import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import type { TFunction } from 'i18next'

export type DigikalaOrderMeta = {
  marketplace?: string
  digikala_fulfillment?: string
  digikala_shipment_id?: string
  digikala_native_status?: string
  remote_status?: string
  remote_order_id?: string
  status?: string
}

function nativeLabel(t: TFunction, status?: string) {
  if (!status) return ''
  return t(`digikala.nativeStatus.${status}`, { defaultValue: status })
}

type DigikalaOrderActionsProps = {
  orderId: number
  order: DigikalaOrderMeta
  onDone: () => void
}

export function DigikalaOrderActions({ orderId, order, onDone }: DigikalaOrderActionsProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [code, setCode] = useState('')
  const fulfillment = order.digikala_fulfillment || 'digikala'
  const isSbs = fulfillment === 'seller'

  const cancel = useMutation({
    mutationFn: () =>
      apiFetch(`digikala/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_reason_id: -1 }),
      }),
    onSuccess: () => {
      toast.success(t('digikala.cancelQueued'))
      onDone()
      void qc.invalidateQueries({ queryKey: ['order', orderId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const sbs = useMutation({
    mutationFn: (action: string) =>
      apiFetch(`digikala/orders/${orderId}/sbs-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          verification_code: code,
        }),
      }),
    onSuccess: () => {
      toast.success(t('digikala.statusPushed'))
      onDone()
      void qc.invalidateQueries({ queryKey: ['order', orderId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="space-y-3 rounded-md border border-border/70 p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('digikala.orderActions')}</p>
        <p className="text-muted-foreground text-xs">
          {t('digikala.fulfillment')}:           {t(`digikala.fulfillment.${fulfillment}`, { defaultValue: fulfillment })}
          {order.digikala_native_status || order.remote_status
            ? ` · ${nativeLabel(t, order.digikala_native_status || order.remote_status)}`
            : ''}
        </p>
      </div>
      {isSbs ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{t('digikala.verificationCode')}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-32"
              dir="ltr"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={sbs.isPending}
            onClick={() => void sbs.mutateAsync('processing')}
          >
            {t('digikala.sbs.processing')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={sbs.isPending}
            onClick={() => void sbs.mutateAsync('processed')}
          >
            {t('digikala.sbs.processed')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={sbs.isPending}
            onClick={() => void sbs.mutateAsync('full_delivered_to_customer')}
          >
            {t('digikala.sbs.delivered')}
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">{t('digikala.warehouseHint')}</p>
      )}
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={cancel.isPending}
        onClick={() => void cancel.mutateAsync()}
      >
        {t('digikala.cancelItem')}
      </Button>
    </div>
  )
}

export function digikalaWooStatusAllowed(order: DigikalaOrderMeta, next: string): string | null {
  if (order.marketplace !== 'digikala') {
    return null
  }
  const fulfillment = order.digikala_fulfillment || 'digikala'
  if (next === 'cancelled') {
    return null
  }
  if (fulfillment === 'seller') {
    if (['processing', 'completed'].includes(next)) {
      return null
    }
    return 'digikala.invalidWooStatus'
  }
  if (['processing', 'completed', 'refunded'].includes(next)) {
    return null
  }
  return 'digikala.invalidWooStatus'
}
