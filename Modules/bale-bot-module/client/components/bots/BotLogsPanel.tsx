import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DateTimePicker } from '@/components/DateTimePicker'
import { ListPageSkeleton } from '@/components/skeletons'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BotProvider } from '@/types/bots'

type LogEntry = { ts: number; level: string; channel: string; msg: string; ctx: Record<string, unknown> }

type LogsResponse = { entries: LogEntry[] }

export function BotLogsPanel({ provider }: { provider: BotProvider }) {
  const { t, i18n } = useTranslation()
  const base = `bots/${provider}`
  const [fromUnix, setFromUnix] = useState<number | null>(null)
  const [toUnix, setToUnix] = useState<number | null>(null)
  const [channel, setChannel] = useState('')

  const q = useQuery({
    queryKey: ['bots', provider, 'logs', fromUnix, toUnix, channel],
    queryFn: () => {
      const p = new URLSearchParams()
      if (fromUnix != null) p.set('from', String(fromUnix))
      if (toUnix != null) p.set('to', String(toUnix))
      if (channel.trim()) p.set('channel', channel.trim())
      const qs = p.toString()
      return apiFetch<LogsResponse>(`${base}/logs${qs ? `?${qs}` : ''}`)
    },
  })

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
        onSubmit={(e) => {
          e.preventDefault()
          void q.refetch()
        }}
      >
        <DateTimePicker
          id="log-from"
          label={t('bots.logs.from')}
          value={fromUnix ?? undefined}
          onChange={setFromUnix}
          className="min-w-[200px]"
        />
        <DateTimePicker
          id="log-to"
          label={t('bots.logs.to')}
          value={toUnix ?? undefined}
          onChange={setToUnix}
          className="min-w-[200px]"
        />
        <div>
          <Label htmlFor="log-ch">{t('bots.logs.channel')}</Label>
          <Input
            id="log-ch"
            placeholder={t('bots.logs.channelPlaceholder')}
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" variant="secondary">
          {t('bots.logs.apply')}
        </Button>
      </form>

      {q.isLoading ? <ListPageSkeleton showPageHeader={false} filterFields={0} tableRows={8} tableColumns={4} /> : null}
      {q.isError && <p className="text-sm text-destructive">{t('errors.api.generic')}</p>}
      {q.data && (
        <div className="max-h-[480px] overflow-auto rounded-lg border border-border text-xs">
          <table className="w-full">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-start text-muted-foreground">
                <th className="p-2">{t('bots.logs.colTime')}</th>
                <th className="p-2">{t('bots.logs.colLevel')}</th>
                <th className="p-2">{t('bots.logs.colChannel')}</th>
                <th className="p-2">{t('bots.logs.colMessage')}</th>
              </tr>
            </thead>
            <tbody>
              {[...q.data.entries].reverse().map((row, i) => (
                <tr key={`${row.ts}-${i}`} className="border-t border-border align-top">
                  <td className="whitespace-nowrap p-2">{formatDisplayDateTime(row.ts, i18n.language)}</td>
                  <td className="p-2">{row.level}</td>
                  <td className="p-2">{row.channel}</td>
                  <td className="p-2 font-mono text-[11px] leading-snug">{row.msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
