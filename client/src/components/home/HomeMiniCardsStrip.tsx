import { Activity, Bot, Package, Shield, ShoppingCart, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewPanels, DashboardOverviewProductStats } from '@/types/dashboardOverview'

type SmsRefetchState = {
  status: 'loading' | 'error'
  onRetry: () => void
  message?: string
}

type HomeMiniCardsStripProps = {
  panels?: DashboardOverviewPanels
  products?: DashboardOverviewProductStats
  locale: string
  smsRefetch?: SmsRefetchState
}

function MiniCard({
  title,
  value,
  hint,
  href,
  icon: Icon,
  variant = 'default',
  onRetry,
  retryLabel,
}: {
  title: string
  value: string
  hint?: string
  href?: string
  icon: typeof Package
  variant?: 'default' | 'error'
  onRetry?: () => void
  retryLabel?: string
}) {
  const isError = variant === 'error'
  const inner = (
    <div
      className={`flex min-h-[5.25rem] min-w-[10rem] shrink-0 flex-col justify-between rounded-lg border px-3 py-2 shadow-sm ${
        isError ? 'border-destructive/60 bg-destructive/5' : 'border-border bg-card'
      }`}
    >
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className={`size-3.5 shrink-0 ${isError ? 'text-destructive' : ''}`} />
        <span className="truncate">{title}</span>
      </div>
      <p className={`text-base font-semibold leading-tight ${isError ? 'text-destructive' : ''}`}>{value}</p>
      <p className={`line-clamp-2 text-[10px] ${isError ? 'text-destructive/80' : 'text-muted-foreground'}`}>
        {hint ?? '\u00a0'}
      </p>
      {onRetry && retryLabel ? (
        <button
          type="button"
          className="text-primary mt-1 text-start text-[10px] font-medium hover:underline"
          onClick={onRetry}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
  if (href && !onRetry) {
    return (
      <Link to={href} className="transition-opacity hover:opacity-90">
        {inner}
      </Link>
    )
  }
  return inner
}

export function HomeMiniCardsStrip({ panels, products, locale, smsRefetch }: HomeMiniCardsStripProps) {
  const { t } = useTranslation()

  if (!panels && !products) return null

  const smsError =
    panels?.sms &&
    (panels.sms.unavailable || panels.sms.low_balance || panels.sms.balance === null)

  const smsLoading = smsRefetch?.status === 'loading'
  const smsFetchError = smsRefetch?.status === 'error'

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {products ? (
        <MiniCard
          title={t('home.sections.products')}
          value={formatNumber(products.total, locale)}
          hint={t('home.products.total')}
          href="/shop/products"
          icon={Package}
        />
      ) : null}

      {panels?.sms ? (
        <MiniCard
          title={t('home.panels.smsCharge')}
          value={
            smsLoading
              ? '…'
              : panels.sms.unavailable || panels.sms.balance === null
                ? '—'
                : formatNumber(panels.sms.balance, locale)
          }
          hint={
            smsLoading
              ? t('home.sms.checking')
              : smsFetchError
                ? t('home.sms.fetchFailed')
                : panels.sms.unavailable
                  ? t('home.panels.smsUnavailable')
                  : panels.sms.low_balance
                    ? t('home.sms.lowBalance')
                    : panels.sms.price_per_unit > 0
                      ? `${t('home.panels.smsUnitPrice')}: ${formatNumber(panels.sms.price_per_unit, locale)}`
                      : t('home.sms.charge')
          }
          href={smsFetchError ? undefined : '/marketing/sms/topup'}
          icon={Wallet}
          variant={smsError || smsFetchError ? 'error' : 'default'}
          onRetry={smsFetchError ? smsRefetch.onRetry : undefined}
          retryLabel={smsFetchError ? t('home.sms.retry') : undefined}
        />
      ) : null}

      <MiniCard
        title={t('home.panels.license')}
        value={panels?.license.active ? t('home.panels.active') : t('home.panels.inactive')}
        hint={panels?.license.active ? t('home.panels.active') : t('home.panels.inactive')}
        href="/settings/site"
        icon={Shield}
        variant={panels?.license.active ? 'default' : 'error'}
      />

      <MiniCard
        title={t('home.sections.traffic')}
        value={panels?.analytics.active ? formatNumber(panels.analytics.online, locale) : t('home.panels.inactive')}
        hint={panels?.analytics.active ? t('home.traffic.onlineNow') : '\u00a0'}
        href="/analytics/overview"
        icon={Activity}
        variant={panels?.analytics.active ? 'default' : 'error'}
      />

      <MiniCard
        title={t('home.storeModule')}
        value={panels?.woocommerce.active ? t('home.panels.active') : t('home.panels.inactive')}
        hint={panels?.woocommerce.active ? t('home.panels.active') : t('home.panels.inactive')}
        href="/settings/shop"
        icon={ShoppingCart}
        variant={panels?.woocommerce.active ? 'default' : 'error'}
      />

      {panels?.bots?.map((bot) => {
        const botError = !bot.webhook_configured || Boolean(bot.last_error)
        return (
          <MiniCard
            key={bot.provider}
            title={t(`home.panels.bot.${bot.provider}`, bot.provider)}
            value={formatNumber(bot.sessions_24h, locale)}
            hint={bot.webhook_configured ? t('home.panels.webhookOk') : t('home.panels.webhookOff')}
            href={`/bots/${bot.provider}`}
            icon={Bot}
            variant={botError ? 'error' : 'default'}
          />
        )
      })}
    </div>
  )
}
