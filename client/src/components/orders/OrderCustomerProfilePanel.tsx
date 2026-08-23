import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { OrderSidebarPanel } from '@/components/orders/OrderSidebarPanel'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { localizeDigits } from '@/lib/digits'

type UserProfile = {
  job?: string
  national_id?: string
  birth_date?: string
  landline?: string
}

type UserBank = {
  bank_name?: string
  account_number?: string
  card_number?: string
  sheba?: string
}

type UserDetail = {
  profile?: UserProfile
  bank?: UserBank
  bots?: { bale?: { connected?: boolean; username?: string }; telegram?: { connected?: boolean; username?: string } }
}

type OrderCustomerProfilePanelProps = {
  customerId?: number
  locale: string
  nationalIdFromOrder?: string
  onBots?: (bots: UserDetail['bots']) => void
}

export function OrderCustomerProfilePanel({
  customerId,
  locale,
  nationalIdFromOrder,
  onBots,
}: OrderCustomerProfilePanelProps) {
  const { t } = useTranslation()
  const q = useQuery({
    queryKey: ['user', customerId],
    queryFn: async () => {
      const data = await apiFetch<UserDetail>(`users/${customerId}`)
      onBots?.(data.bots)
      return data
    },
    enabled: Boolean(customerId && customerId > 0),
  })
  useQueryErrorToast(q)

  if (!customerId || customerId <= 0) {
    return (
      <OrderSidebarPanel title={t('orders.panelCustomerProfile')}>
        <p className="text-muted-foreground text-sm">{t('orders.guestCustomer')}</p>
        {nationalIdFromOrder ? (
          <p className="mt-2 text-sm">
            {t('orders.nationalId')}:{' '}
            <span className="font-mono">{localizeDigits(nationalIdFromOrder, locale)}</span>
          </p>
        ) : null}
      </OrderSidebarPanel>
    )
  }

  const profile = q.data?.profile
  const bank = q.data?.bank

  return (
    <OrderSidebarPanel title={t('orders.panelCustomerProfile')}>
      {q.isLoading ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : (
        <div className="space-y-4 text-sm">
          <dl className="grid gap-2">
            <Row label={t('users.fieldNationalId')} value={profile?.national_id || nationalIdFromOrder} locale={locale} mono />
            <Row label={t('users.fieldJob')} value={profile?.job} locale={locale} />
            <Row label={t('users.fieldBirthDate')} value={profile?.birth_date} locale={locale} />
            <Row label={t('users.fieldLandline')} value={profile?.landline} locale={locale} mono />
          </dl>
          <div>
            <p className="mb-2 text-sm font-medium">{t('users.sectionBank')}</p>
            <dl className="grid gap-2">
              <Row label={t('users.fieldBankName')} value={bank?.bank_name} locale={locale} />
              <Row label={t('users.fieldBankAccount')} value={bank?.account_number} locale={locale} mono />
              <Row label={t('users.fieldBankCard')} value={bank?.card_number} locale={locale} mono />
              <Row label={t('users.fieldBankSheba')} value={bank?.sheba} locale={locale} mono />
            </dl>
          </div>
        </div>
      )}
    </OrderSidebarPanel>
  )
}

function Row({
  label,
  value,
  locale,
  mono,
}: {
  label: string
  value?: string
  locale: string
  mono?: boolean
}) {
  const { t } = useTranslation()
  if (!value) {
    return (
      <div>
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="text-muted-foreground">{t('common.emptyValue')}</dd>
      </div>
    )
  }
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={mono ? 'font-mono' : undefined}>{mono ? localizeDigits(value, locale) : value}</dd>
    </div>
  )
}
