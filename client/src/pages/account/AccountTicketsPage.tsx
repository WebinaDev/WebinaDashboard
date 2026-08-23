import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDateTime } from '@/lib/date'

export type SupportTicket = {
  id: number
  user_id: number
  subject: string
  status: string
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

type TicketsPayload = { items: SupportTicket[]; total: number; page: number }

const STATUSES = ['open', 'answered', 'pending', 'closed'] as const

export function ticketStatusLabel(t: (k: string) => string, status: string) {
  return t(`account.ticketStatus.${status}`)
}

export default function AccountTicketsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const q = useQuery({
    queryKey: ['account', 'tickets'],
    queryFn: () => apiFetch<TicketsPayload>('account/tickets'),
  })
  useQueryErrorToast(q)

  const create = useMutation({
    mutationFn: () =>
      apiFetch<SupportTicket>('account/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      setSubject('')
      setBody('')
      void qc.invalidateQueries({ queryKey: ['account', 'tickets'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('account.ticketsTitle')} description={t('account.ticketsSubtitle')}>
      <Card className="mb-6">
        <CardContent className="space-y-3 p-4">
          <div>
            <Label>{t('account.ticketSubject')}</Label>
            <Input className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>{t('account.ticketBody')}</Label>
            <Textarea className="mt-1" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <Button
            type="button"
            disabled={create.isPending || !subject.trim() || !body.trim()}
            onClick={() => void create.mutateAsync()}
          >
            {t('account.ticketCreate')}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(q.data?.items ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
        ) : (
          (q.data?.items ?? []).map((row) => (
            <Link key={row.id} to={`/account/tickets/${row.id}`} className="block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{row.subject}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDisplayDateTime(row.updated_at, i18n.language)}
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

export { STATUSES }
