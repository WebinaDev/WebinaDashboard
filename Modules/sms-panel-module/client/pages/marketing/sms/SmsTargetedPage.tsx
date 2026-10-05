import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  outboxId,
  outboxMessage,
  outboxSender,
  outboxTime,
  outboxType,
  resolveOutboxStatus,
  smsField,
  unwrapSmsList,
} from '@/lib/sms-report'
import { translateSmsStatus } from '@/lib/sms-ui'
import { fetchSmsBulkRecipients, fetchSmsBulkStats, fetchSmsOutbox, smsQueryOptions } from '@/lib/modirpayamak-api'

function statsEntries(data: unknown): Array<{ key: string; value: string }> {
  if (!data || typeof data !== 'object') return []
  const obj = data as Record<string, unknown>
  const src =
    obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)
      ? (obj.data as Record<string, unknown>)
      : obj
  return Object.entries(src)
    .filter(([, v]) => v !== null && typeof v !== 'object')
    .map(([key, value]) => ({ key, value: String(value) }))
}

export default function SmsTargetedPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const [selected, setSelected] = useState('')
  const outboxQ = useQuery({
    queryKey: ['sms', 'outbox', 'targeted'],
    queryFn: () => fetchSmsOutbox(1, 40),
    ...smsQueryOptions,
  })
  useQueryErrorToast(outboxQ)
  const unavailable = isSmsUnavailable(outboxQ.data)
  const rows = useMemo(
    () => (unavailable ? [] : unwrapSmsList(outboxQ.data?.data)),
    [unavailable, outboxQ.data],
  )

  const statsQ = useQuery({
    queryKey: ['sms', 'bulk-stats', selected],
    queryFn: () => fetchSmsBulkStats(selected),
    enabled: !!selected,
    ...smsQueryOptions,
  })
  const recipientsQ = useQuery({
    queryKey: ['sms', 'bulk-recipients', selected],
    queryFn: () => fetchSmsBulkRecipients(selected, 1),
    enabled: !!selected,
    ...smsQueryOptions,
  })
  useQueryErrorToast(statsQ)
  useQueryErrorToast(recipientsQ)

  const stats = statsEntries(statsQ.data?.data ?? statsQ.data)
  const recipients = unwrapSmsList(recipientsQ.data?.data ?? recipientsQ.data)

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('marketing.sms.targetedTitle')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.targetedHint')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void outboxQ.refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t('marketing.sms.refresh')}
        </Button>
      </div>
      {unavailable ? (
        <SmsServiceBanner message={outboxQ.data?.message} onRetry={() => void outboxQ.refetch()} />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.pickCampaign')}</CardTitle>
          <CardDescription>{t('marketing.sms.selectOutbox')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            className="max-w-xs font-mono"
            dir="ltr"
            placeholder={t('marketing.sms.outboxIdPlaceholder')}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          />
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('marketing.sms.outboxId')}</TableHead>
                  <TableHead>{t('marketing.sms.senderLine')}</TableHead>
                  <TableHead>{t('marketing.sms.type')}</TableHead>
                  <TableHead>{t('marketing.sms.message')}</TableHead>
                  <TableHead>{t('marketing.sms.status')}</TableHead>
                  <TableHead>{t('marketing.sms.sentAt')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {outboxQ.isPending
                  ? Array.from({ length: 4 }, (_, i) => (
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
                        const id = outboxId(r)
                        return (
                          <TableRow key={`${id}-${i}`}>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {locale.startsWith('fa') ? toPersianDigits(id) : id}
                            </TableCell>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {outboxSender(r)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{outboxType(r)}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[14rem] truncate" title={outboxMessage(r)}>
                              {outboxMessage(r)}
                            </TableCell>
                            <TableCell>{resolveOutboxStatus(t, r)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatSmsDateTime(outboxTime(r), locale)}
                            </TableCell>
                            <TableCell className="text-end">
                              {id !== '—' ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={selected === id ? 'default' : 'outline'}
                                  onClick={() => setSelected(id)}
                                >
                                  {t('marketing.sms.viewStats')}
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        )
                      })}
              </TableBody>
            </Table>
          </ScrollTable>
        </CardContent>
      </Card>

      {selected ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('marketing.sms.bulkStats')}</CardTitle>
            </CardHeader>
            <CardContent>
              {statsQ.isPending ? (
                <Skeleton className="h-24 w-full" />
              ) : stats.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
              ) : (
                <ScrollTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('marketing.sms.statKey')}</TableHead>
                        <TableHead>{t('marketing.sms.statValue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.map((row) => (
                        <TableRow key={row.key}>
                          <TableCell className="font-mono text-xs" dir="ltr">
                            {row.key}
                          </TableCell>
                          <TableCell dir="ltr">{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollTable>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('marketing.sms.recipients')}</CardTitle>
            </CardHeader>
            <CardContent>
              {recipientsQ.isPending ? (
                <Skeleton className="h-24 w-full" />
              ) : recipients.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
              ) : (
                <ScrollTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('marketing.sms.phone')}</TableHead>
                        <TableHead>{t('marketing.sms.status')}</TableHead>
                        <TableHead>{t('marketing.sms.date')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipients.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs" dir="ltr">
                            {smsField(r, 'recipient', 'phone', 'to', 'mobile', 'number') || '—'}
                          </TableCell>
                          <TableCell>
                            {translateSmsStatus(t, r.status ?? r.state ?? r.deliver_status)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatSmsDateTime(r.time ?? r.created_at ?? r.send_time, locale)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollTable>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
