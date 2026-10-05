import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toPersianDigits } from '@/lib/date'
import {
  formatSmsDateTime,
  smsField,
  unwrapSmsList,
} from '@/lib/sms-report'
import { fetchSmsInbox, smsQueryOptions } from '@/lib/modirpayamak-api'

const PAGE_SIZE = 30

export default function SmsInboxPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const [page, setPage] = useState(1)

  const q = useQuery({
    queryKey: ['sms', 'inbox', page],
    queryFn: () => fetchSmsInbox(page, PAGE_SIZE),
    ...smsQueryOptions,
  })
  useQueryErrorToast(q)

  const unavailable = isSmsUnavailable(q.data)
  const rows = unavailable ? [] : unwrapSmsList(q.data?.data)

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('marketing.sms.inboxTitle')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.inboxHint')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void q.refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t('marketing.sms.refresh')}
        </Button>
      </div>

      {unavailable ? (
        <SmsServiceBanner message={q.data?.message} onRetry={() => void q.refetch()} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.inboxTitle')}</CardTitle>
          <CardDescription>{t('marketing.sms.inboxHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('marketing.sms.outboxId')}</TableHead>
                  <TableHead>{t('marketing.sms.from')}</TableHead>
                  <TableHead>{t('marketing.sms.toLine')}</TableHead>
                  <TableHead>{t('marketing.sms.message')}</TableHead>
                  <TableHead>{t('marketing.sms.type')}</TableHead>
                  <TableHead>{t('marketing.sms.status')}</TableHead>
                  <TableHead>{t('marketing.sms.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isPending
                  ? Array.from({ length: 6 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-7 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : rows.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-muted-foreground text-sm">
                            {t('marketing.sms.noMessages')}
                          </TableCell>
                        </TableRow>
                      )
                    : rows.map((r, i) => {
                        const id = smsField(r, 'messages_inbox_id', 'id') || String(i + 1)
                        const seen = smsField(r, 'seen')
                        const message = smsField(r, 'message', 'text', 'body')
                        return (
                          <TableRow key={`${id}-${i}`}>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {locale.startsWith('fa') ? toPersianDigits(id) : id}
                            </TableCell>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {smsField(r, 'from', 'sender') || '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {smsField(r, 'number', 'to', 'line') || '—'}
                            </TableCell>
                            <TableCell className="max-w-[22rem] truncate" title={message}>
                              {message || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{smsField(r, 'type') || '—'}</Badge>
                            </TableCell>
                            <TableCell>
                              {seen === '1' || seen === 'true'
                                ? t('marketing.sms.seen')
                                : t('marketing.sms.unseen')}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatSmsDateTime(r.time ?? r.created_at ?? r.received_at, locale)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
              </TableBody>
            </Table>
          </ScrollTable>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || q.isPending}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground text-sm">
              {locale.startsWith('fa')
                ? toPersianDigits(t('marketing.sms.pageOf', { page: String(page) }))
                : t('marketing.sms.pageOf', { page: String(page) })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={q.isPending || rows.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
