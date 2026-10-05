import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { formatNumber } from '@/lib/formatNumber'
import { toastApiError } from '@/lib/apiError'

type ApiEnvelope<T> = {
  success?: boolean
  status_code?: number
  message?: string
  data?: T
}

type BalanceData = {
  calculated_at?: number
  balance?: number
  settled?: { cash?: number; credit?: number }
  future_balance?: number
}

type SettlementItem = {
  id?: number | string
  amount?: number
  status_label?: string
  status_description?: string
  status?: { description?: string; name?: string }
  method?: { description?: string }
  created_at?: number
  payable_at?: number
}

type PagedSettlements = {
  data?: SettlementItem[]
  total?: number
  per_page?: number
  current_page?: number
  last_page?: number
}

type FinanceResponse = {
  ok?: boolean
  balance?: ApiEnvelope<BalanceData>
  settlements?: ApiEnvelope<PagedSettlements>
  history?: ApiEnvelope<PagedSettlements>
}

/** Basalam accounting amounts are in rials; WooSalam UI shows toman (÷10). */
function rialToToman(amount: unknown): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  return Math.trunc(amount / 10)
}

function formatToman(amount: unknown, locale: string, empty = '—'): string {
  const toman = rialToToman(amount)
  if (toman === null) return empty
  return formatNumber(toman, locale)
}

function settlementStatusLabel(item: SettlementItem): string {
  if (typeof item.status_label === 'string' && item.status_label) return item.status_label
  if (typeof item.status?.description === 'string' && item.status.description) return item.status.description
  return '—'
}

function SettlementList({
  envelope,
  emptyLabel,
  locale,
}: {
  envelope: ApiEnvelope<PagedSettlements> | undefined
  emptyLabel: string
  locale: string
}) {
  const { t } = useTranslation()

  if (!envelope) {
    return <p className="text-muted-foreground text-sm">{t('basalam.financeLoading')}</p>
  }
  if (!envelope.success) {
    return <p className="text-destructive text-sm">{envelope.message || t('basalam.financeError')}</p>
  }

  const items = Array.isArray(envelope.data?.data) ? envelope.data.data : []
  const total = typeof envelope.data?.total === 'number' ? envelope.data.total : items.length

  if (items.length === 0 || total === 0) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item, idx) => {
        const key = item.id ?? idx
        return (
          <li key={String(key)} className="bg-muted/40 rounded-lg border p-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">#{item.id ?? '—'}</span>
              <span className="font-semibold">
                {formatToman(item.amount, locale)} {t('basalam.toman')}
              </span>
            </div>
            <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <span>{settlementStatusLabel(item)}</span>
              {item.method?.description ? <span>{item.method.description}</span> : null}
              <span>
                {t('basalam.settlementCreated')}: {formatDisplayDateTime(item.created_at, locale)}
              </span>
              {item.payable_at ? (
                <span>
                  {t('basalam.settlementPayable')}: {formatDisplayDateTime(item.payable_at, locale)}
                </span>
              ) : null}
            </div>
            {item.status_description ? (
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{item.status_description}</p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export default function BasalamFinancePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const qc = useQueryClient()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('1')
  const [bankId, setBankId] = useState('')

  const q = useQuery({
    queryKey: ['basalam', 'finance'],
    queryFn: () => apiFetch<FinanceResponse>('basalam/finance/balance'),
  })

  const banksQ = useQuery({
    queryKey: ['basalam', 'finance', 'banks'],
    queryFn: () => apiFetch<{ banks?: { data?: Array<{ id?: number; card_number?: string; sheba?: string }> } }>('basalam/finance/banks'),
  })

  const settle = useMutation({
    mutationFn: () =>
      apiFetch('basalam/finance/settlement', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(amount) || 0,
          method: Number(method) || 1,
          bank_account_id: bankId ? Number(bankId) : undefined,
        }),
      }),
    onSuccess: async () => {
      toast.success(t('basalam.settlementCreatedOk'))
      setAmount('')
      await qc.invalidateQueries({ queryKey: ['basalam', 'finance'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const balanceEnv = q.data?.balance
  const balanceData =
    balanceEnv?.success && balanceEnv.data && typeof balanceEnv.data === 'object'
      ? balanceEnv.data
      : undefined
  const showFuture =
    typeof balanceData?.future_balance === 'number' && balanceData.future_balance !== 0

  const bankList = Array.isArray(banksQ.data?.banks?.data)
    ? banksQ.data.banks.data
    : Array.isArray((banksQ.data as { banks?: { data?: unknown } } | undefined)?.banks?.data)
      ? ((banksQ.data as { banks: { data: Array<{ id?: number; card_number?: string; sheba?: string }> } }).banks.data)
      : []

  return (
    <PageShell title={t('basalam.financeTitle')} description={t('basalam.financeSubtitle')}>
      <BasalamNav />
      {q.isLoading ? <p className="text-muted-foreground text-sm">{t('basalam.financeLoading')}</p> : null}
      {q.isError ? <p className="text-destructive text-sm">{t('basalam.financeError')}</p> : null}

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('basalam.boothBalance')}</CardTitle>
            <CardDescription>
              {balanceData?.calculated_at
                ? t('basalam.balanceAsOf', {
                    time: formatDisplayDateTime(balanceData.calculated_at, locale),
                  })
                : t('basalam.balance')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balanceEnv && !balanceEnv.success ? (
              <p className="text-destructive text-sm">{balanceEnv.message || t('basalam.financeError')}</p>
            ) : (
              <p className="text-2xl font-semibold tracking-tight">
                {formatToman(balanceData?.balance, locale)}{' '}
                <span className="text-muted-foreground text-sm font-normal">{t('basalam.toman')}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('basalam.settledBankYtd')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatToman(balanceData?.settled?.cash, locale)}{' '}
              <span className="text-muted-foreground text-sm font-normal">{t('basalam.toman')}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('basalam.settledWalletYtd')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatToman(balanceData?.settled?.credit, locale)}{' '}
              <span className="text-muted-foreground text-sm font-normal">{t('basalam.toman')}</span>
            </p>
          </CardContent>
        </Card>

        {showFuture ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('basalam.futureBalance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold tracking-tight">
                {formatToman(balanceData?.future_balance, locale)}{' '}
                <span className="text-muted-foreground text-sm font-normal">{t('basalam.toman')}</span>
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('basalam.createSettlement')}</CardTitle>
          <CardDescription>{t('basalam.createSettlementHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input
            type="number"
            placeholder={t('basalam.settlementAmount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="1">{t('basalam.settleMethod.bank')}</option>
            <option value="2">{t('basalam.settleMethod.wallet')}</option>
          </select>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
          >
            <option value="">{t('basalam.selectBank')}</option>
            {bankList.map((b) => (
              <option key={String(b.id)} value={String(b.id ?? '')}>
                {b.card_number || b.sheba || t('basalam.bankAccount')}
              </option>
            ))}
          </select>
          <Button onClick={() => settle.mutate()} disabled={settle.isPending || !amount}>
            {t('basalam.submitSettlement')}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.activeSettlements')}</CardTitle>
            <CardDescription>{t('basalam.activeSettlementsHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SettlementList
              envelope={q.data?.settlements}
              emptyLabel={t('basalam.noActiveSettlements')}
              locale={locale}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.settlementHistory')}</CardTitle>
            <CardDescription>{t('basalam.settlementHistoryHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SettlementList
              envelope={q.data?.history}
              emptyLabel={t('basalam.noSettlementHistory')}
              locale={locale}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
