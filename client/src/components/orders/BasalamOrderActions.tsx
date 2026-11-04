import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Ban, Check, Clock, Hash, Truck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export type BasalamOrderMeta = {
  marketplace?: string
  remote_order_id?: string | number
  status?: string
}

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
  phone?: string
  onDone: () => void
}

export function BasalamOrderActions({ orderId, order, phone, onDone }: Props) {
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
      void qc.invalidateQueries({ queryKey: ['basalam', 'order-view', orderId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="space-y-3">
      {order.remote_order_id ? (
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <Hash className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <span className="text-muted-foreground">{t('basalam.basalamInvoice')}</span>
          <span className="font-medium tracking-wide">{String(order.remote_order_id)}</span>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border p-3">
          <SectionTitle icon={Check} label={t('basalam.groupDecision')} />
          <Field label={t('basalam.cancelReasonLabel')}>
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((reason) => (
                  <SelectItem key={reason.id} value={String(reason.id)}>
                    {t(reason.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={action.isPending}
              onClick={() => action.mutate({ path: 'basalam/orders/confirm', payload: { order_id: orderId } })}
            >
              <Check className="size-3.5" aria-hidden />
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
              <Ban className="size-3.5" aria-hidden />
              {t('basalam.cancelOrder')}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border p-3">
          <SectionTitle icon={Truck} label={t('basalam.groupShip')} />
          <Field label={t('basalam.shipMethodLabel')}>
            <Select value={shipMethod} onValueChange={setShipMethod}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIP_METHODS.map((method) => (
                  <SelectItem key={method.id} value={String(method.id)}>
                    {t(method.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('basalam.trackingCode')}>
            <div className="flex gap-2">
              <Input className="h-9" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              <Button
                size="sm"
                className="shrink-0"
                disabled={action.isPending || !tracking.trim()}
                onClick={() =>
                  action.mutate({
                    path: 'basalam/orders/tracking',
                    payload: {
                      order_id: orderId,
                      tracking_code: tracking.trim(),
                      shipping_method: Number(shipMethod) || SHIP_METHODS[0].id,
                      phone: phone || '',
                    },
                  })
                }
              >
                {t('basalam.shipOrder')}
              </Button>
            </div>
          </Field>
        </section>
      </div>

      <section className="space-y-3 rounded-xl border p-3">
        <SectionTitle icon={Clock} label={t('basalam.groupDelay')} />
        <div className="grid items-end gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]">
          <Field label={t('basalam.delayDays')}>
            <Input className="h-9" inputMode="numeric" value={delayDays} onChange={(e) => setDelayDays(e.target.value)} />
          </Field>
          <Field label={t('basalam.delayDesc')}>
            <Input className="h-9" value={delayDesc} onChange={(e) => setDelayDesc(e.target.value)} />
          </Field>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
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
      </section>
    </div>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: typeof Check; label: string }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium">
      <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full">
        <Icon className="size-3.5" aria-hidden />
      </span>
      {label}
    </p>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      {children}
    </div>
  )
}
