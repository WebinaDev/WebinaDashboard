import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { formatNumber } from '@/lib/formatNumber'

type BalanceEnvelope = {
  ok?: boolean
  balance?: {
    success?: boolean
    data?: { balance?: number }
  }
}

function rialToToman(amount: unknown): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  return Math.trunc(amount / 10)
}

/** Compact Basalam wallet balance for reports / accounting overview. */
export function BasalamBalanceCard() {
  const { t, i18n } = useTranslation()
  const q = useQuery({
    queryKey: ['basalam', 'finance', 'balance-lite'],
    queryFn: () => apiFetch<BalanceEnvelope>('basalam/finance/balance'),
    retry: false,
    staleTime: 60_000,
  })

  const balance = rialToToman(q.data?.balance?.data?.balance)
  if (q.isError || (q.isSuccess && !q.data?.balance?.success && balance === null)) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('basalam.boothBalance')}</CardTitle>
        <CardDescription>{t('basalam.balanceInReports')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight">
          {q.isLoading ? '…' : balance !== null ? formatNumber(balance, i18n.language) : '—'}{' '}
          <span className="text-muted-foreground text-sm font-normal">{t('basalam.toman')}</span>
        </p>
        <Button asChild size="sm" variant="outline">
          <Link to="/settings/shop/basalam/finance">{t('basalam.financeDetailsLink')}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
