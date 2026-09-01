import { Box, CircleDollarSign, Package, RotateCcw, Send, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import type {
  DashboardFulfillmentAction,
  DashboardFulfillmentBucket,
  DashboardFulfillmentItem,
  DashboardOverviewFulfillment,
} from '@/types/dashboardOverview'

type HomeFulfillmentTodosProps = {
  fulfillment?: DashboardOverviewFulfillment
}

type GroupDef = {
  key: keyof DashboardOverviewFulfillment
  action: DashboardFulfillmentAction
  icon: typeof Package
  tone: string
}

const GROUPS: GroupDef[] = [
  { key: 'pack', action: 'pack', icon: Package, tone: 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300' },
  { key: 'ship', action: 'ship', icon: Truck, tone: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300' },
  { key: 'tracking', action: 'tracking', icon: Send, tone: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-700 dark:text-cyan-300' },
  { key: 'returns', action: 'return', icon: RotateCcw, tone: 'border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300' },
  { key: 'refund', action: 'refund', icon: CircleDollarSign, tone: 'border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300' },
]

function shippingMethodLabel(
  t: (key: string, opts?: Record<string, string>) => string,
  item: DashboardFulfillmentItem,
): string {
  const kind = item.shipping_kind || 'other'
  if (kind === 'courier') return t('home.fulfillment.shipping.courier')
  if (kind === 'post') return t('home.fulfillment.shipping.post')
  if (kind === 'tipax') return t('home.fulfillment.shipping.tipax')
  const label = (item.shipping_label || '').trim()
  return label ? t('home.fulfillment.shipping.other', { label }) : t('home.fulfillment.shipping.post')
}

function itemMessage(
  t: (key: string, opts?: Record<string, string>) => string,
  item: DashboardFulfillmentItem,
): string {
  const number = item.number || String(item.id)
  const name = item.customer_name || '—'
  switch (item.action) {
    case 'pack':
      return t('home.fulfillment.pack', { number, name })
    case 'ship':
      return t('home.fulfillment.ship', { number, method: shippingMethodLabel(t, item) })
    case 'tracking':
      return t('home.fulfillment.tracking', { number })
    case 'return':
      if (item.return_status === 'approved') {
        return t('home.fulfillment.returnApproved', {
          number,
          item: item.return_item || '—',
          qty: String(item.return_qty ?? ''),
        })
      }
      return t('home.fulfillment.returnRequested', {
        number,
        item: item.return_item || '—',
        qty: String(item.return_qty ?? ''),
      })
    case 'refund':
      if (item.purchase_type === 'installment') {
        return t('home.fulfillment.refundInstallment', { number })
      }
      return t('home.fulfillment.refundCash', {
        number,
        gateway: item.payment_method_title
          ? t('home.fulfillment.refundCashGateway', { gateway: item.payment_method_title })
          : '',
      })
    default:
      return number
  }
}

function GroupBlock({
  groupKey,
  bucket,
  icon: Icon,
  tone,
}: {
  groupKey: GroupDef['key']
  bucket: DashboardFulfillmentBucket
  icon: GroupDef['icon']
  tone: string
}) {
  const { t } = useTranslation()
  if (!bucket?.items?.length) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium ${tone}`}>
          <Icon className="size-3.5 shrink-0" aria-hidden />
          {t(`home.fulfillment.group.${groupKey}`)}
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {bucket.count}
          </Badge>
        </div>
        {bucket.href ? (
          <Link to={bucket.href} className="text-primary text-xs hover:underline">
            {t('home.fulfillment.viewAll')}
          </Link>
        ) : null}
      </div>
      <ul className="space-y-1.5">
        {bucket.items.map((item) => (
          <li key={`${groupKey}-${item.id}`}>
            <Link
              to={item.href || `/orders/${item.id}`}
              className="hover:bg-muted/60 block rounded-lg border bg-card px-3 py-2 text-sm leading-relaxed transition-colors"
            >
              {itemMessage(t, item)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HomeFulfillmentTodos({ fulfillment }: HomeFulfillmentTodosProps) {
  const { t } = useTranslation()
  if (!fulfillment) return null

  const total =
    (fulfillment.pack?.count ?? 0) +
    (fulfillment.ship?.count ?? 0) +
    (fulfillment.tracking?.count ?? 0) +
    (fulfillment.returns?.count ?? 0) +
    (fulfillment.refund?.count ?? 0)

  const hasItems = GROUPS.some((g) => (fulfillment[g.key]?.items?.length ?? 0) > 0)

  return (
    <div className="bg-card rounded-2xl border p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Box className="text-primary size-4" aria-hidden />
            {t('home.fulfillment.title')}
          </h3>
          {total > 0 ? (
            <p className="text-muted-foreground mt-1 text-xs">
              {total} {t('home.sections.fulfillment')}
            </p>
          ) : null}
        </div>
      </div>

      {!hasItems ? (
        <p className="text-muted-foreground text-sm">{t('home.fulfillment.empty')}</p>
      ) : (
        <div className="space-y-5">
          {GROUPS.map((g) => (
            <GroupBlock
              key={g.key}
              groupKey={g.key}
              bucket={fulfillment[g.key]}
              icon={g.icon}
              tone={g.tone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
