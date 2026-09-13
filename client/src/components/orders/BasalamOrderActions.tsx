import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export type BasalamOrderMeta = {
  marketplace?: string
  remote_order_id?: string | number
  status?: string
}

/** Internal Basalam reason / shipping method ids — never shown as raw numbers in labels. */
const CANCEL_REASONS = [
  { id: 3481, labelKey: 'basalam.cancelReason.buyerRequest' },
  { id: 3482, labelKey: 'basalam.cancelReason.outOfStock' },
  { id: 3483, labelKey: 'basalam.cancelReason.other' },
] as const

const SHIP_METHODS = [
  { id: 3197, labelKey: 'basalam.shipMethod.post' },
  { id: 3198, labelKey: 'basalam.shipMethod.tipax' },
  { id: 3199, labelKey: 'basalam.shipMethod.courier' },
] as const

type Props = {
  orderId: number
  order: BasalamOrderMeta
  onDone: () => void
}

export function BasalamOrderActions({ orderId, order, onDone }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [tracking, setTracking] = useState('')
  const [cancelReason, setCancelReason] = useState(String(CANCEL_REASONS[0].id))
  const [shipMethod, setShipMethod] = useState(String(SHIP_METHODS[0].id))
  const [delayDays, setDelayDays] = useState('')
  const [delayDesc, setDelayDesc] = useState('')

  const action = useMutation({
    mutationFn: (body: { path: string; payload: Record<string, unknown> }) =>
      apiFetch(body.path, { method: 'POST', body: JSON.stringify(body.payload) }),
    onSuccess: async () => {
      toast.success(t('basalam.orderActionOk'))
      onDone()
      void qc.invalidateQueries({ queryKey: ['order', orderId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="space-y-3 rounded-md border border-border/70 p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('basalam.orderActions')}</p>
        {order.remote_order_id ? (
          <p className="text-muted-foreground text-xs">
            {t('basalam.basalamInvoice')}: {String(order.remote_order_id)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={action.isPending}
          onClick={() =>
            action.mutate({ path: 'basalam/orders/confirm', payload: { order_id: orderId } })
          }
        >
          {t('basalam.confirmOrder')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={action.isPending}
          onClick={() =>
            action.mutate({
              path: 'basalam/orders/cancel',
              payload: {
                order_id: orderId,
                reason_id: Number(cancelReason) || CANCEL_REASONS[0].id,
                description: '',
              },
            })
          }
        >
          {t('basalam.cancelOrder')}
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">{t('basalam.cancelReasonLabel')}</Label>
          <select
            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {t(r.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t('basalam.shipMethodLabel')}</Label>
          <select
            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
            value={shipMethod}
            onChange={(e) => setShipMethod(e.target.value)}
          >
            {SHIP_METHODS.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {t(m.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t('basalam.trackingCode')}</Label>
          <Input
            className="h-9 w-[10rem]"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={action.isPending || !tracking.trim()}
          onClick={() =>
            action.mutate({
              path: 'basalam/orders/tracking',
              payload: {
                order_id: orderId,
                tracking_code: tracking.trim(),
                shipping_method: Number(shipMethod) || SHIP_METHODS[0].id,
                phone: '',
              },
            })
          }
        >
          {t('basalam.shipOrder')}
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          className="h-9 w-[5rem]"
          placeholder={t('basalam.delayDays')}
          value={delayDays}
          onChange={(e) => setDelayDays(e.target.value)}
        />
        <Input
          className="h-9 min-w-[10rem] flex-1"
          placeholder={t('basalam.delayDesc')}
          value={delayDesc}
          onChange={(e) => setDelayDesc(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={action.isPending || !delayDays || !delayDesc}
          onClick={() =>
            action.mutate({
              path: 'basalam/orders/delay',
              payload: {
                order_id: orderId,
                postpone_days: Number(delayDays) || 0,
                description: delayDesc,
              },
            })
          }
        >
          {t('basalam.delayOrder')}
        </Button>
      </div>
    </div>
  )
}
