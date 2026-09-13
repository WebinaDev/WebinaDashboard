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
  reason?: string
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

function smsRoleLabel(t: (key: string) => string, role?: string): string {
  const r = (role || '').toLowerCase()
  if (!r || r === 'system') return ''
  const key = `orders.smsRole.${r}`
  const translated = t(key)
  return translated !== key ? translated : r
}

function smsReasonLabel(t: (key: string) => string, reason?: string): string {
  const r = (reason || '').trim()
  if (!r) return ''
  const key = `orders.smsReason.${r}`
  const translated = t(key)
  return translated !== key ? translated : r
}

export function OrderSmsHistoryPanel({ entries = [], locale }: OrderSmsHistoryPanelProps) {
  const { t } = useTranslation()

  return (
    <OrderSidebarPanel title={t('orders.panelSmsHistory')} defaultOpen={entries.length > 0}>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('orders.smsHistoryEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {[...entries].reverse().map((e, i) => {
            const role = smsRoleLabel(t, e.role)
            const reason = smsReasonLabel(t, e.reason)
            return (
              <li key={`${e.time}-${e.event}-${e.role}-${i}`} className="min-w-0 rounded-md border p-2 text-sm">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 break-words font-medium">{smsEventLabel(t, e.event)}</span>
                  <Badge variant={smsStatusVariant(e.status)} className="shrink-0">
                    {smsStatusLabel(t, e.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 break-words text-xs">
                  {formatDisplayDateTime(e.time, locale)}
                  {e.phone ? ` · ${localizeDigits(e.phone, locale)}` : ''}
                  {role ? ` · ${role}` : ''}
                </p>
                {reason ? (
                  <p className="text-muted-foreground mt-1 break-words text-xs">{reason}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </OrderSidebarPanel>
  )
}
