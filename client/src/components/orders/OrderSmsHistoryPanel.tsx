import { useTranslation } from 'react-i18next'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { Badge } from '@/components/ui/badge'
import { formatDisplayDateTime } from '@/lib/date'
import { localizeDigits } from '@/lib/digits'

export type SmsLogEntry = {
  time?: string
  status?: string
  event?: string
  phone?: string
  source?: string
}

type OrderSmsHistoryPanelProps = {
  entries?: SmsLogEntry[]
  locale: string
}

export function OrderSmsHistoryPanel({ entries = [], locale }: OrderSmsHistoryPanelProps) {
  const { t } = useTranslation()

  return (
    <OrderSidebarPanel title={t('orders.panelSmsHistory')} defaultOpen={false}>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('orders.smsHistoryEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {[...entries].reverse().map((e, i) => {
            const ok = e.status === 'sent' || e.status === 'delivered' || e.status === 'ok'
            return (
              <li key={`${e.time}-${i}`} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{e.event || t('orders.sms.manual')}</span>
                  <Badge variant={ok ? 'default' : 'destructive'}>
                    {ok ? t('orders.smsStatus.delivered') : t('orders.smsStatus.failed')}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDisplayDateTime(e.time, locale)}
                  {e.phone ? ` · ${localizeDigits(e.phone, locale)}` : ''}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </OrderSidebarPanel>
  )
}
