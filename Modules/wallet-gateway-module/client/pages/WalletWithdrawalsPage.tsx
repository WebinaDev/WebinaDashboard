import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { MoneyDisplay } from '@/components/currency/MoneyDisplay'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type Withdrawal = {
  id: number
  user_id: number
  user_name: string
  amount: number
  sheba: string
  status: string
  admin_note: string
  created_at: string
}

export default function WalletWithdrawalsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['wallet', 'withdrawals'],
    queryFn: () => apiFetch<{ items: Withdrawal[] }>('shop/wallet-withdrawals?status=pending'),
  })

  const patch = useMutation({
    mutationFn: async (payload: { id: number; status: string }) =>
      apiFetch('shop/wallet-withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = q.data?.items ?? []

  return (
    <PageShell title={t('wallet.withdrawalsTitle')} subtitle={t('wallet.withdrawalsSubtitle')}>
      {q.isLoading ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('wallet.withdrawalsEmpty')}</p>
      ) : (
        <div className="grid gap-3">
          {items.map((row) => (
            <article key={row.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{row.user_name || `#${row.user_id}`}</p>
                <p>
                  <MoneyDisplay amount={row.amount} currency="IRT" locale={i18n.language} />
                </p>
                <p className="font-mono text-xs">{row.sheba}</p>
                <p className="text-muted-foreground text-xs">{row.created_at}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={patch.isPending}
                  onClick={() => void patch.mutateAsync({ id: row.id, status: 'approved' })}
                >
                  {t('wallet.approve')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={patch.isPending}
                  onClick={() => void patch.mutateAsync({ id: row.id, status: 'paid' })}
                >
                  {t('wallet.markPaid')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={patch.isPending}
                  onClick={() => void patch.mutateAsync({ id: row.id, status: 'rejected' })}
                >
                  {t('wallet.reject')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
