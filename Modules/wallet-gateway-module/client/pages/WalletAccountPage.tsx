import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type LedgerItem = {
  id: number
  direction: string
  amount: number
  balance_after: number
  reason: string
  note: string
  created_at: string
}

type WalletPayload = {
  balance: number
  ledger: { items: LedgerItem[]; total: number }
  sheba?: string
  refund_method?: string
  min_topup?: number
  min_withdraw?: number
}

export default function WalletAccountPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [topup, setTopup] = useState('')
  const [withdraw, setWithdraw] = useState('')
  const [refund, setRefund] = useState('wallet')

  const q = useQuery({
    queryKey: ['account', 'wallet'],
    queryFn: () => apiFetch<WalletPayload>('account/wallet'),
  })

  const data = q.data

  useEffect(() => {
    if (data?.refund_method) setRefund(data.refund_method)
  }, [data?.refund_method])

  const topupMut = useMutation({
    mutationFn: async () =>
      apiFetch<{ payment_url: string }>('account/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(topup) }),
      }),
    onSuccess: (res) => {
      if (res.payment_url) window.location.href = res.payment_url
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const withdrawMut = useMutation({
    mutationFn: async () =>
      apiFetch('account/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdraw) }),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      setWithdraw('')
      await qc.invalidateQueries({ queryKey: ['account', 'wallet'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const prefsMut = useMutation({
    mutationFn: async (method: string) =>
      apiFetch('account/wallet/prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refund_method: method }),
      }),
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const method = refund

  return (
    <PageShell title={t('wallet.accountTitle')} description={t('wallet.accountSubtitle')}>
      {!data ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : (
        <div className="grid max-w-2xl gap-6">
          <section className="rounded-xl border border-border p-4">
            <p className="text-muted-foreground text-xs">{t('wallet.balance')}</p>
            <p className="mt-1 text-2xl font-semibold">
              <MoneyDisplay amount={data.balance} currency="IRT" locale={i18n.language} />
            </p>
          </section>

          <section className="grid gap-3 rounded-xl border border-border p-4">
            <Label>{t('wallet.topup')}</Label>
            <Input
              type="number"
              min={data.min_topup ?? 1000}
              value={topup}
              onChange={(e) => setTopup(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {t('wallet.minTopupHint', { amount: data.min_topup ?? 1000 })}
            </p>
            <Button type="button" disabled={topupMut.isPending} onClick={() => void topupMut.mutateAsync()}>
              {t('wallet.topupPay')}
            </Button>
          </section>

          <section className="grid gap-3 rounded-xl border border-border p-4">
            <Label>{t('wallet.withdraw')}</Label>
            {data.sheba ? (
              <p className="font-mono text-sm">{data.sheba}</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('wallet.needSheba')}{' '}
                <Link className="text-primary underline-offset-4 hover:underline" to="/account/profile">
                  {t('wallet.editProfile')}
                </Link>
              </p>
            )}
            <Input
              type="number"
              min={data.min_withdraw ?? 10000}
              value={withdraw}
              onChange={(e) => setWithdraw(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={withdrawMut.isPending || !data.sheba}
              onClick={() => void withdrawMut.mutateAsync()}
            >
              {t('wallet.withdrawSubmit')}
            </Button>
          </section>

          <section className="grid gap-3 rounded-xl border border-border p-4">
            <Label>{t('wallet.refundMethod')}</Label>
            <Select
              value={method}
              onValueChange={(v) => {
                setRefund(v)
                void prefsMut.mutateAsync(v)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">{t('wallet.refundWallet')}</SelectItem>
                <SelectItem value="bank">{t('wallet.refundBank')}</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">{t('wallet.ledger')}</h2>
            {(data.ledger.items ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('wallet.ledgerEmpty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs">
                      <th className="px-2 py-2 text-start">{t('wallet.col.date')}</th>
                      <th className="px-2 py-2 text-start">{t('wallet.col.reason')}</th>
                      <th className="px-2 py-2 text-start">{t('wallet.col.amount')}</th>
                      <th className="px-2 py-2 text-start">{t('wallet.col.balance')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ledger.items.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-2 py-2">{row.created_at}</td>
                        <td className="px-2 py-2">{t(`wallet.reason.${row.reason}`, { defaultValue: row.reason })}</td>
                        <td className="px-2 py-2">
                          {row.direction === 'debit' ? '−' : '+'}
                          <MoneyDisplay amount={row.amount} currency="IRT" locale={i18n.language} />
                        </td>
                        <td className="px-2 py-2">
                          <MoneyDisplay amount={row.balance_after} currency="IRT" locale={i18n.language} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  )
}
