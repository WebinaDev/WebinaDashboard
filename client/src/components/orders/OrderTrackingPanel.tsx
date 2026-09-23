import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { notifyOrderSms } from '@/lib/modirpayamak-api'
import { isSafeContentUrl } from '@/lib/safeUrl'

export type TrackingProviderOption = {
  id: string
  title: string
  sms_event?: string
  pattern_bound?: boolean
  pattern_name?: string
}

type OrderTrackingPanelProps = {
  orderId: number
  trackingCode?: string
  trackingUrl?: string
  trackingProvider?: string
  deliveryDate?: string
  deliveryTime?: string
  postBarcode?: string
  trackingProviders?: TrackingProviderOption[]
  onSaved: () => void
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

export function OrderTrackingPanel({
  orderId,
  trackingCode = '',
  trackingUrl = '',
  trackingProvider = '',
  deliveryDate = '',
  deliveryTime = '',
  postBarcode = '',
  trackingProviders = [],
  onSaved,
}: OrderTrackingPanelProps) {
  const { t } = useTranslation()
  const [code, setCode] = useState(trackingCode)

  const activeProviders = useMemo(
    () => trackingProviders.filter((p) => p.pattern_bound && p.id),
    [trackingProviders]
  )

  const knownIds = useMemo(() => new Set(activeProviders.map((o) => o.id)), [activeProviders])
  const initialProvider =
    trackingProvider && knownIds.has(trackingProvider)
      ? trackingProvider
      : activeProviders[0]?.id ?? ''
  const [providerSelect, setProviderSelect] = useState(initialProvider)

  useEffect(() => {
    setCode(trackingCode)
    if (trackingProvider && knownIds.has(trackingProvider)) {
      setProviderSelect(trackingProvider)
    } else if (!providerSelect || !knownIds.has(providerSelect)) {
      setProviderSelect(activeProviders[0]?.id ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from server props
  }, [trackingCode, trackingProvider, activeProviders, knownIds])

  const canAct = Boolean(code.trim() && providerSelect && knownIds.has(providerSelect))

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_code: code, tracking_provider: providerSelect }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      onSaved()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const sendSms = useMutation({
    mutationFn: async () => {
      if (!canAct) {
        throw new Error(t('orders.trackingSmsNeedCodeProvider'))
      }
      const selected = activeProviders.find((p) => p.id === providerSelect)
      if (!selected?.pattern_bound) {
        throw new Error(t('orders.trackingSmsNoPattern'))
      }
      await apiFetch(`orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_code: code, tracking_provider: providerSelect }),
      })
      return notifyOrderSms({
        order_id: orderId,
        event_key: selected.sms_event || providerSelect,
        force_customer: true,
      })
    },
    onSuccess: (res) => {
      if (res.skipped) {
        toast.error(res.reason || t('orders.trackingSmsNoPattern'))
        onSaved()
        return
      }
      toast.success(t('orders.trackingSmsSent'))
      onSaved()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const busy = save.isPending || sendSms.isPending

  return (
    <OrderSidebarPanel title={t('orders.panelTracking')}>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="tracking-code">{t('orders.trackingCode')}</Label>
          <Input id="tracking-code" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t('orders.trackingProvider')}</Label>
          {activeProviders.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t('orders.trackingNoActiveProviders')}</p>
          ) : (
            <Select value={providerSelect || undefined} onValueChange={setProviderSelect}>
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
        {postBarcode ? (
          <p className="text-muted-foreground break-words text-xs">
            {t('orders.postBarcode')}: <span className="text-foreground break-all">{postBarcode}</span>
          </p>
        ) : null}
        {trackingUrl && isSafeContentUrl(trackingUrl) ? (
          <p className="min-w-0 text-sm">
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary break-all hover:underline"
            >
              {t('orders.trackingLink')}
            </a>
          </p>
        ) : null}
        {deliveryDate || deliveryTime ? (
          <p className="text-muted-foreground text-xs">
            {t('orders.deliverySlot')}: {[deliveryDate, deliveryTime].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy || !canAct}
            onClick={() => void save.mutateAsync()}
          >
            {t('common.save')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy || !canAct}
            onClick={() => void sendSms.mutateAsync()}
          >
            {t('orders.sendTrackingSms')}
          </Button>
        </div>
      </div>
    </OrderSidebarPanel>
  )
}
