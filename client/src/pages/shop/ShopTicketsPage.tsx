import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { ticketStatusLabel, type SupportTicket } from '@/pages/account/AccountTicketsPage'

type TicketsPayload = { items: SupportTicket[]; total: number; page: number }

export default function ShopTicketsPage() {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const q = useQuery({
    queryKey: ['shop', 'tickets', status, search],
    queryFn: () => {
      const p = new URLSearchParams()
      if (status) p.set('status', status)
      if (search.trim()) p.set('search', search.trim())
      const qs = p.toString()
      return apiFetch<TicketsPayload>(`shop/tickets${qs ? `?${qs}` : ''}`)
    },
  })
  useQueryErrorToast(q)

  return (
    <PageShell title={t('account.staffTicketsTitle')} description={t('account.staffTicketsSubtitle')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('account.ticketSearch')}
        />
        <select
          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t('orders.tabAll')}</option>
          {['open', 'answered', 'pending', 'closed'].map((s) => (
            <option key={s} value={s}>
              {ticketStatusLabel(t, s)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {(q.data?.items ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
        ) : (
          (q.data?.items ?? []).map((row) => (
            <Link key={row.id} to={`/shop/tickets/${row.id}`} className="block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{row.subject}</p>
                    <p className="text-muted-foreground text-xs">
                      {row.user_name} · {formatDisplayDateTime(row.updated_at, i18n.language)}
                    </p>
                  </div>
                  <Badge variant={row.status === 'closed' ? 'secondary' : 'default'}>
                    {ticketStatusLabel(t, row.status)}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  )
}
