import { BotCouponsPanel } from './BotCouponsPanel'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, MessageSquare, ScrollText, Settings, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { BotProvider } from '@/types/bots'
import { MoneyDisplay, WcPriceText } from '@/components/currency/MoneyDisplay'
import { QueryErrorState } from '@/components/QueryErrorState'
import { TableListSkeleton } from '@/components/TableListSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { parseWcPriceText } from '@/lib/currency'
import { localizeDigits } from '@/lib/digits'
import { formatNumber } from '@/lib/formatNumber'

type DashboardStats = {
  users_linked: number
  orders_all: number
  orders_7d: number
  sessions_24h: number
  sales_compare: {
    days: number
    current: { count: number; total: number; total_text?: string }
    previous: { count: number; total: number; total_text?: string }
  }
  recent_orders: Array<{
    id: number
    number: string
    total_text: string
    status_name: string
    date: string
    edit_url: string
  }>
  recent_users: Array<{
    id: number
    display_name: string
    phone: string
    chat_id: string
    edit_url: string
  }>
}

function SaleTotal({
  block,
  locale,
  currency,
  currencySymbol,
}: {
  block: { total: number; total_text?: string }
  locale: string
  currency: string
  currencySymbol: string
}) {
  if (block.total_text && block.total_text.trim() !== '') {
    if (parseWcPriceText(block.total_text).isToman) {
      return <WcPriceText text={block.total_text} />
    }
    return <span>{block.total_text}</span>
  }
  return (
    <MoneyDisplay
      amount={Math.round(block.total)}
      currency={currency}
      currencySymbol={currencySymbol}
      locale={locale}
    />
  )
}

export function BotDashboardPanel({ provider }: { provider: BotProvider }) {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const base = `bots/${provider}`

  const q = useQuery({
    queryKey: ['bots', provider, 'dashboard-stats'],
    queryFn: () => apiFetch<DashboardStats>(`${base}/dashboard-stats`),
  })
  useQueryErrorToast(q)

  const quickLinks = [
    { to: `/settings/site/bots?provider=${provider}`, icon: Settings, label: t('bots.tabs.settings') },
    { to: `/users/list?bot=${provider}`, icon: Users, label: t('bots.tabs.users') },
    { to: `/marketing/bot-broadcast?provider=${provider}`, icon: Megaphone, label: t('bots.tabs.broadcast') },
    { to: `/marketing/bot-campaigns?provider=${provider}`, icon: MessageSquare, label: t('bots.tabs.campaigns') },
    { to: `/settings/site/system-logs?provider=${provider}`, icon: ScrollText, label: t('bots.tabs.logs') },
  ]

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="space-y-2 pt-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <TableListSkeleton rows={6} columns={4} />
      </div>
    )
  }

  if (q.isError || !q.data) {
    return <QueryErrorState onRetry={() => void q.refetch()} />
  }
  const d = q.data

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('bots.quickLinks')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickLinks.map(({ to, icon: Icon, label }) => (
            <Button key={to} variant="outline" size="sm" asChild>
              <Link to={to}>
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('bots.stats.usersLinked')} value={formatNumber(d.users_linked, i18n.language)} />
        <StatCard label={t('bots.stats.ordersAll')} value={formatNumber(d.orders_all, i18n.language)} />
        <StatCard label={t('bots.stats.orders7d')} value={formatNumber(d.orders_7d, i18n.language)} />
        <StatCard label={t('bots.stats.sessions24h')} value={formatNumber(d.sessions_24h, i18n.language)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('bots.stats.salesCurrentCount')} value={formatNumber(d.sales_compare.current.count, i18n.language)} />
        <StatCard
          label={t('bots.stats.salesCurrentTotal')}
          value={
            <SaleTotal
              block={d.sales_compare.current}
              locale={i18n.language}
              currency={store.currency}
              currencySymbol={store.currencySymbol}
            />
          }
        />
        <StatCard label={t('bots.stats.salesPrevCount')} value={formatNumber(d.sales_compare.previous.count, i18n.language)} />
        <StatCard
          label={t('bots.stats.salesPrevTotal')}
          value={
            <SaleTotal
              block={d.sales_compare.previous}
              locale={i18n.language}
              currency={store.currency}
              currencySymbol={store.currencySymbol}
            />
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('bots.stats.recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="p-2">{t('bots.stats.colOrder')}</th>
                  <th className="p-2">{t('bots.stats.colTotal')}</th>
                  <th className="p-2">{t('bots.stats.colStatus')}</th>
                  <th className="p-2">{t('bots.stats.colDate')}</th>
                </tr>
              </thead>
              <tbody>
                {d.recent_orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-3 text-muted-foreground">
                      {t('bots.stats.empty')}
                    </td>
                  </tr>
                ) : (
                  d.recent_orders.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="p-2">
                        <Link to={`/orders/list/${o.id}`} className="text-primary underline-offset-4 hover:underline">
                          #{localizeDigits(o.number, i18n.language)}
                        </Link>
                      </td>
                      <td className="p-2">
                        <WcPriceText text={o.total_text} locale={i18n.language} />
                      </td>
                      <td className="p-2">{o.status_name}</td>
                      <td className="p-2 text-xs text-muted-foreground">{o.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('bots.stats.recentUsers')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="p-2">{t('bots.stats.colUser')}</th>
                  <th className="p-2">{t('bots.stats.colPhone')}</th>
                  <th className="p-2">{t('bots.stats.colChatId')}</th>
                </tr>
              </thead>
              <tbody>
                {d.recent_users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-3 text-muted-foreground">
                      {t('bots.stats.empty')}
                    </td>
                  </tr>
                ) : (
                  d.recent_users.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="p-2">
                        <Link to={`/users/${u.id}`} className="text-primary underline-offset-4 hover:underline">
                          {u.display_name}
                        </Link>
                      </td>
                      <td className="p-2">{localizeDigits(u.phone, i18n.language)}</td>
                      <td className="p-2 font-mono text-xs">{u.chat_id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <AdvancedStatsCard provider={provider} />

      <BotCouponsPanel provider={provider} />
    </div>
  )
}

type AdvancedStats = {
  by_payment_method?: Record<string, { count: number; total: number }>
  abandon_recovery_rate?: number
  coupons_issued?: number
  coupons_used?: number
}

function AdvancedStatsCard({ provider }: { provider: BotProvider }) {
  const { t, i18n } = useTranslation()
  const q = useQuery({
    queryKey: ['bots', provider, 'stats-advanced'],
    queryFn: () => apiFetch<AdvancedStats>(`bots/${provider}/stats/advanced`),
  })
  if (q.isError || !q.data) return null
  const d = q.data
  const methods = d.by_payment_method || {}

  const downloadCsv = () => {
    const rows = [['method', 'count', 'total']]
    for (const [k, v] of Object.entries(methods)) {
      rows.push([k, String(v.count ?? 0), String(v.total ?? 0)])
    }
    rows.push(['abandon_recovery_rate', String(d.abandon_recovery_rate ?? ''), ''])
    rows.push(['coupons_issued', String(d.coupons_issued ?? ''), ''])
    rows.push(['coupons_used', String(d.coupons_used ?? ''), ''])
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bot-stats-${provider}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-base">{t('bots.stats.advanced')}</CardTitle>
        <Button type="button" size="sm" variant="outline" onClick={downloadCsv}>
          CSV
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        {Object.entries(methods).map(([k, v]) => (
          <div key={k} className="rounded-md border border-border p-2">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="font-semibold tabular-nums">{formatNumber(v.count, i18n.language)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatNumber(Math.round(v.total), i18n.language)}</p>
          </div>
        ))}
        {typeof d.abandon_recovery_rate === 'number' ? (
          <div className="rounded-md border border-border p-2">
            <p className="text-xs text-muted-foreground">{t('bots.stats.abandonRecovery')}</p>
            <p className="font-semibold tabular-nums">{formatNumber(d.abandon_recovery_rate, i18n.language)}%</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
