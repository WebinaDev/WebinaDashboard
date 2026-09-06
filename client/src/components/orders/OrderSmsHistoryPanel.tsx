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
  role?: string
}

type OrderSmsHistoryPanelProps = {
  entries?: SmsLogEntry[]
  locale: string
}

function smsEventLabel(t: (key: string) => string, event?: string): string {
  const key = (event || '').trim()
  if (!key) return t('orders.sms.manual')
  const i18nKey = `settings.shopSms.events.${key}`
  const translated = t(i18nKey)
  return translated === i18nKey ? key : translated
}

function smsStatusVariant(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = (status || '').toLowerCase()
  if (s === 'failed') return 'destructive'
  if (s === 'queued' || s === 'skipped') return 'secondary'
  if (s === 'sent' || s === 'delivered' || s === 'ok') return 'default'
  return 'outline'
}

function smsStatusLabel(t: (key: string) => string, status?: string): string {
  const s = (status || '').toLowerCase()
  const key = `orders.smsStatus.${s}`
  const translated = t(key)
  if (translated !== key) return translated
  if (s === 'ok') return t('orders.smsStatus.delivered')
  return s || '—'
}

export function OrderSmsHistoryPanel({ entries = [], locale }: OrderSmsHistoryPanelProps) {
  const { t } = useTranslation()

  return (
    <OrderSidebarPanel title={t('orders.panelSmsHistory')} defaultOpen={false}>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('orders.smsHistoryEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {[...entries].reverse().map((e, i) => (
            <li key={`${e.time}-${e.event}-${i}`} className="min-w-0 rounded-md border p-2 text-sm">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="min-w-0 break-words font-medium">{smsEventLabel(t, e.event)}</span>
                <Badge variant={smsStatusVariant(e.status)} className="shrink-0">
                  {smsStatusLabel(t, e.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 break-words text-xs">
                {formatDisplayDateTime(e.time, locale)}
                {e.phone ? ` · ${localizeDigits(e.phone, locale)}` : ''}
                {e.role ? ` · ${e.role}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </OrderSidebarPanel>
  )
}
