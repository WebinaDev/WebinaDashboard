import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import {
  statusForTrackingProvider,
  type StatusOption,
} from '@/components/orders/OrderStatusStepper'
import type { TrackingProviderOption } from '@/components/orders/OrderTrackingPanel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { notifyOrderSms } from '@/lib/modirpayamak-api'

type ShippingOption = { id: string; title: string }

export type OrderShipDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number
  trackingCode?: string
  trackingProvider?: string
  shippingMethodTitle?: string
  shippingItems?: { id?: string; name: string }[]
  shippingMethodOptions?: ShippingOption[]
  trackingProviders?: TrackingProviderOption[]
  availableStatuses?: StatusOption[]
  onDone: () => void
}

function providerOptionLabel(
  o: TrackingProviderOption,
  t: (key: string, opts?: Record<string, string>) => string
): string {
  const name = (o.pattern_name ?? '').trim()
  if (name) {
    return t('orders.trackingProviderWithPattern', { title: o.title, pattern: name })
  }
  return t('orders.trackingProviderPatternBound', { title: o.title })
}

function guessProviderFromShipping(
  title: string,
  methodId: string,
  activeIds: Set<string>
): string {
  const hay = `${title} ${methodId}`.toLowerCase()
  const tryKind = (kind: string) => (activeIds.has(kind) ? kind : '')
  if (/tipax|تیپاکس/.test(hay)) return tryKind('tipax')
  if (/chapar|چاپار/.test(hay)) return tryKind('chapar')
  if (/courier|peyk|pik|پیک/.test(hay)) return tryKind('courier')
  if (/post|postal|پست/.test(hay)) return tryKind('post')
  return tryKind('other') || [...activeIds][0] || ''
}

export function OrderShipDialog({
  open,
  onOpenChange,
  orderId,
  trackingCode = '',
  trackingProvider = '',
  shippingMethodTitle = '',
  shippingItems = [],
  shippingMethodOptions = [],
  trackingProviders = [],
  availableStatuses = [],
  onDone,
}: OrderShipDialogProps) {
  const { t } = useTranslation()
  const [code, setCode] = useState(trackingCode)

  const activeProviders = useMemo(
    () => trackingProviders.filter((p) => p.pattern_bound && p.id),
    [trackingProviders]
  )
  const knownProviderIds = useMemo(() => new Set(activeProviders.map((p) => p.id)), [activeProviders])

  const customerMethodId = shippingItems[0]?.id || ''
  const defaultShippingId =
    (customerMethodId && shippingMethodOptions.some((o) => o.id === customerMethodId)
      ? customerMethodId
      : shippingMethodOptions.find((o) => o.title === shippingMethodTitle)?.id) ||
    shippingMethodOptions[0]?.id ||
    ''

  const [shippingMethodId, setShippingMethodId] = useState(defaultShippingId)

  const initialProvider = useMemo(() => {
    if (trackingProvider && knownProviderIds.has(trackingProvider)) return trackingProvider
    const selected = shippingMethodOptions.find((o) => o.id === (shippingMethodId || defaultShippingId))
    return (
      guessProviderFromShipping(
        selected?.title || shippingMethodTitle,
        selected?.id || customerMethodId,
        knownProviderIds
      ) ||
      activeProviders[0]?.id ||
      ''
    )
  }, [
    trackingProvider,
    knownProviderIds,
    shippingMethodId,
    defaultShippingId,
    shippingMethodOptions,
    shippingMethodTitle,
    customerMethodId,
    activeProviders,
  ])

  const [providerSelect, setProviderSelect] = useState(initialProvider)

  useEffect(() => {
    if (!open) return
    setCode(trackingCode)
    setShippingMethodId(defaultShippingId)
    setProviderSelect(initialProvider)
  }, [open, trackingCode, defaultShippingId, initialProvider])

  const canSave = Boolean(code.trim() && providerSelect && knownProviderIds.has(providerSelect))

  const persist = async (sendSms: boolean) => {
    if (!canSave) {
      throw new Error(t('orders.trackingSmsNeedCodeProvider'))
    }
    const selected = activeProviders.find((p) => p.id === providerSelect)
    if (!selected?.pattern_bound) {
      throw new Error(t('orders.trackingSmsNoPattern'))
    }
    const nextStatus = statusForTrackingProvider(providerSelect, availableStatuses)
    const body: Record<string, string> = {
      tracking_code: code.trim(),
      tracking_provider: providerSelect,
      status: nextStatus,
    }
    if (shippingMethodId) {
      body.shipping_method_id = shippingMethodId
    }
    await apiFetch(`orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (sendSms) {
      const res = await notifyOrderSms({
        order_id: orderId,
        event_key: selected.sms_event || providerSelect,
        force_customer: true,
      })
      if (res.skipped) {
        throw new Error(res.reason || t('orders.trackingSmsNoPattern'))
      }
    }
  }

  const save = useMutation({
    mutationFn: () => persist(false),
    onSuccess: () => {
      toast.success(t('common.saved'))
      onOpenChange(false)
      onDone()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveAndSms = useMutation({
    mutationFn: () => persist(true),
    onSuccess: () => {
      toast.success(t('orders.trackingSmsSent'))
      onOpenChange(false)
      onDone()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const busy = save.isPending || saveAndSms.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('orders.shipDialog.title')}</DialogTitle>
          <DialogDescription>{t('orders.shipDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-2">
            <Label htmlFor="ship-tracking-code">{t('orders.trackingCode')}</Label>
            <Input
              id="ship-tracking-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={busy}
            />
          </div>
          {shippingMethodOptions.length ? (
            <div className="space-y-2">
              <Label>{t('orders.shippingMethod')}</Label>
              <Select
                value={shippingMethodId || undefined}
                onValueChange={(v) => {
                  setShippingMethodId(v)
                  const opt = shippingMethodOptions.find((o) => o.id === v)
                  const guessed = guessProviderFromShipping(opt?.title || '', v, knownProviderIds)
                  if (guessed) setProviderSelect(guessed)
                }}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('orders.selectShippingMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {shippingMethodOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>{t('orders.trackingProvider')}</Label>
            {activeProviders.length === 0 ? (
              <p className="text-muted-foreground text-xs">{t('orders.trackingNoActiveProviders')}</p>
            ) : (
              <Select
                value={providerSelect || undefined}
                onValueChange={setProviderSelect}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('orders.selectTrackingProvider')} />
                </SelectTrigger>
                <SelectContent>
                  {activeProviders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {providerOptionLabel(o, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy || !canSave}
            onClick={() => void save.mutateAsync()}
          >
            {t('common.save')}
          </Button>
          <Button
            type="button"
            disabled={busy || !canSave}
            onClick={() => void saveAndSms.mutateAsync()}
          >
            {t('orders.sendTrackingSms')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
