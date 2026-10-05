import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BotProvider } from '@/types/bots'

type CouponRow = { id: number; code: string; amount: number; type: string }

export function BotCouponsPanel({ provider }: { provider: BotProvider }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const base = `bots/${provider}`
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('10')
  const [type, setType] = useState('percent')

  const list = useQuery({
    queryKey: ['bots', provider, 'coupons'],
    queryFn: () => apiFetch<{ items: CouponRow[] }>(`${base}/coupons`),
  })

  const create = useMutation({
    mutationFn: () =>
      apiFetch(`${base}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount: Number(amount), type }),
      }),
    onSuccess: async () => {
      setCode('')
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'coupons'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">{t('bots.couponsTitle')}</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="bot-coupon-code">{t('bots.couponCode')}</Label>
          <Input id="bot-coupon-code" className="mt-1 w-40" value={code} onChange={(e) => setCode(e.target.value)} placeholder="BOT…" />
        </div>
        <div>
          <Label htmlFor="bot-coupon-amount">{t('bots.couponAmount')}</Label>
          <Input id="bot-coupon-amount" type="number" className="mt-1 w-28" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>{t('bots.couponType')}</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">%</SelectItem>
              <SelectItem value="fixed_cart">{t('bots.couponFixedCart')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" size="sm" disabled={create.isPending} onClick={() => void create.mutateAsync()}>
          {t('bots.couponCreate')}
        </Button>
      </div>
      {list.isLoading && <p className="text-xs text-muted-foreground">…</p>}
      <ul className="space-y-1 text-sm">
        {(list.data?.items ?? []).map((row) => (
          <li key={row.id} className="font-mono text-xs">
            {row.code} — {row.amount}
            {row.type === 'percent' ? '%' : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
