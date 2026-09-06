import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { isSafeContentUrl } from '@/lib/safeUrl'

type ShippingOption = { id: string; title: string }

type OrderTrackingPanelProps = {
  orderId: number
  trackingCode?: string
  trackingUrl?: string
  trackingProvider?: string
  deliveryDate?: string
  deliveryTime?: string
  postBarcode?: string
  shippingOptions?: ShippingOption[]
  onSaved: () => void
}

const OTHER = 'other'

export function OrderTrackingPanel({
  orderId,
  trackingCode = '',
  trackingUrl = '',
  trackingProvider = '',
  deliveryDate = '',
  deliveryTime = '',
  postBarcode = '',
  shippingOptions = [],
  onSaved,
}: OrderTrackingPanelProps) {
  const { t } = useTranslation()
  const [code, setCode] = useState(trackingCode)
  const knownIds = new Set(shippingOptions.map((o) => o.id))
  const initialKnown = trackingProvider && knownIds.has(trackingProvider) ? trackingProvider : ''
  const [providerSelect, setProviderSelect] = useState(initialKnown || (trackingProvider ? OTHER : ''))
  const [providerCustom, setProviderCustom] = useState(initialKnown ? '' : trackingProvider)

  useEffect(() => {
    setCode(trackingCode)
    const known = trackingProvider && knownIds.has(trackingProvider) ? trackingProvider : ''
    setProviderSelect(known || (trackingProvider ? OTHER : ''))
    setProviderCustom(known ? '' : trackingProvider)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options identity
  }, [trackingCode, trackingProvider])

  const resolvedProvider =
    providerSelect === OTHER || !providerSelect ? providerCustom.trim() : providerSelect

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_code: code, tracking_provider: resolvedProvider }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      onSaved()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <OrderSidebarPanel title={t('orders.panelTracking')}>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="tracking-code">{t('orders.trackingCode')}</Label>
          <Input id="tracking-code" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t('orders.trackingProvider')}</Label>
          <Select
            value={providerSelect || undefined}
            onValueChange={(v) => {
              setProviderSelect(v)
              if (v !== OTHER) setProviderCustom('')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('orders.selectShippingMethod')} />
            </SelectTrigger>
            <SelectContent>
              {shippingOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
              {!shippingOptions.some((o) => o.id === OTHER) ? (
                <SelectItem value={OTHER}>{t('orders.trackingProviderOther')}</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
          {providerSelect === OTHER || !providerSelect ? (
            <Input
              value={providerCustom}
              onChange={(e) => setProviderCustom(e.target.value)}
              placeholder={t('orders.trackingProviderOther')}
            />
          ) : null}
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
        <Button type="button" size="sm" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </div>
    </OrderSidebarPanel>
  )
}
