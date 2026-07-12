import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/formatNumber'
import type { DashboardOverviewSmsPanel } from '@/types/dashboardOverview'

type HomeSmsBalanceCardProps = {
  sms: DashboardOverviewSmsPanel
  locale: string
}

export function HomeSmsBalanceCard({ sms, locale }: HomeSmsBalanceCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={`shadow-sm ${sms.low_balance ? 'border-amber-500/50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{t('home.sections.sms')}</CardTitle>
        <Link className="text-primary text-xs hover:underline" to="/marketing/sms/topup">
          {t('home.sms.topup')}
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">{t('home.sms.charge')}</p>
        <p className="text-2xl font-semibold">{formatNumber(sms.balance ?? 0, locale)}</p>
        {sms.low_balance ? (
          <p className="mt-1 text-xs text-amber-600">{t('home.sms.lowBalance')}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
