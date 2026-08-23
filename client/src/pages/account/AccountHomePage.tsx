import { useQuery } from '@tanstack/react-query'
import { Bell, Heart, LifeBuoy, Package, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HomeOrdersTable } from '@/components/home/HomeOrdersTable'
import { PageShell } from '@/components/PageShell'
import { QueryErrorState } from '@/components/QueryErrorState'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useStoreCurrency } from '@/hooks/useStoreCurrency'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewOrderRow } from '@/types/dashboardOverview'

type AccountOverview = {
  wallet_balance: number
  wallet_enabled?: boolean
  wishlist_count: number
  notifications_unread: number
  tickets_open?: number
  order_groups?: Array<{ slug: string; label: string; count: number }>
  recent_orders?: DashboardOverviewOrderRow[]
}

export default function AccountHomePage() {
  const { t, i18n } = useTranslation()
  const store = useStoreCurrency()
  const q = useQuery({
    queryKey: ['account', 'overview'],
    queryFn: () => apiFetch<AccountOverview>('account/overview'),
  })
  useQueryErrorToast(q)

  const data = q.data
  const locale = i18n.language

  if (q.isError && !data) {
    return (
      <PageShell title={t('account.homeTitle')} description={t('account.homeSubtitle')}>
        <QueryErrorState message={q.error?.message} onRetry={() => void q.refetch()} />
      </PageShell>
    )
  }

  const cards = [
    {
      to: '/account/orders',
      icon: Package,
      label: t('account.cardOrders'),
      value: formatNumber(data?.order_groups?.reduce((n, g) => n + g.count, 0) ?? 0, locale),
    },
    {
      to: '/account/favorites',
      icon: Heart,
      label: t('account.cardFavorites'),
      value: formatNumber(data?.wishlist_count ?? 0, locale),
    },
    {
      to: '/account/notifications',
      icon: Bell,
      label: t('account.cardNotifications'),
      value: formatNumber(data?.notifications_unread ?? 0, locale),
    },
    {
      to: '/account/tickets',
      icon: LifeBuoy,
      label: t('account.cardTickets'),
      value: formatNumber(data?.tickets_open ?? 0, locale),
    },
  ]

  return (
    <PageShell title={t('account.homeTitle')} description={t('account.homeSubtitle')}>
      {q.isLoading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="block">
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <card.icon className="text-muted-foreground size-8 shrink-0" aria-hidden />
                  <div>
                    <p className="text-muted-foreground text-xs">{card.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {data?.wallet_enabled ? (
            <Link to="/account/wallet" className="block sm:col-span-2 lg:col-span-1">
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <Wallet className="text-muted-foreground size-8 shrink-0" aria-hidden />
                  <div>
                    <p className="text-muted-foreground text-xs">{t('account.cardWallet')}</p>
                    <p className="mt-1 text-2xl font-semibold">
                      <MoneyDisplay amount={data.wallet_balance} currency={store.currency} locale={locale} />
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}
        </div>
      )}

      <HomeOrdersTable
        title={t('home.recentOrders')}
        rows={data?.recent_orders ?? []}
        viewAllHref="/account/orders"
        orderHrefBase="/account/orders"
        emptyMessage={t('home.noOrders')}
        currency={store.currency}
        currencySymbol={store.currencySymbol}
        locale={locale}
      />
    </PageShell>
  )
}
