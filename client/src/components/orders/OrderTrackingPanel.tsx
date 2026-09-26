import { useTranslation } from 'react-i18next'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Button } from '@/components/ui/button'
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
  onOpenShip?: () => void
}

export function OrderTrackingPanel({
  trackingCode = '',
  trackingUrl = '',
  trackingProvider = '',
  deliveryDate = '',
  deliveryTime = '',
  postBarcode = '',
  trackingProviders = [],
  onOpenShip,
}: OrderTrackingPanelProps) {
  const { t } = useTranslation()
  const bound = trackingProviders.find((p) => p.id === trackingProvider && p.pattern_bound)
  const providerTitle = bound?.title || trackingProvider

  return (
    <OrderSidebarPanel title={t('orders.panelTracking')}>
      <div className="space-y-3">
        {trackingCode ? (
          <p className="text-sm">
            <span className="text-muted-foreground">{t('orders.trackingCode')}: </span>
            <span className="break-all font-medium">{trackingCode}</span>
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">{t('orders.shipDialog.noTrackingYet')}</p>
        )}
        {providerTitle ? (
          <p className="text-muted-foreground text-xs">
            {t('orders.trackingProvider')}: <span className="text-foreground">{providerTitle}</span>
            {bound?.pattern_name ? ` — ${bound.pattern_name}` : ''}
          </p>
        ) : null}
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
        {onOpenShip ? (
          <Button type="button" size="sm" onClick={onOpenShip}>
            {t('orders.shipDialog.open')}
          </Button>
        ) : null}
      </div>
    </OrderSidebarPanel>
  )
}
