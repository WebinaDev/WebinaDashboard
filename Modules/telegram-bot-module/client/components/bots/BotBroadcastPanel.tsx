import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { KeyValueList, StatusBadge } from '@/components/data/DumpUi'
import { FormSettingsSkeleton } from '@/components/skeletons'
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
import { Textarea } from '@/components/ui/textarea'
import type { BotProvider } from '@/types/bots'

type BroadcastState = {
  job: Record<string, unknown> | null
  advanced_media: boolean
  campaigns_feature: boolean
}

export function BotBroadcastPanel({ provider }: { provider: BotProvider }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const base = `bots/${provider}`

  const q = useQuery({
    queryKey: ['bots', provider, 'broadcast'],
    queryFn: () => apiFetch<BroadcastState>(`${base}/broadcast`),
    refetchInterval: (query) => {
      const j = query.state.data?.job as { active?: boolean } | null | undefined
      return j && j.active ? 4000 : false
    },
  })

  const start = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ ok: boolean; error?: string }>(`${base}/broadcast/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: async (data) => {
      if (!data.ok) {
        toast.error(data.error ?? t('bots.broadcast.failed'))
        return
      }
      toast.success(t('bots.broadcast.started'))
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'broadcast'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const cancel = useMutation({
    mutationFn: () => apiFetch(`${base}/broadcast/cancel`, { method: 'POST', body: '{}' }),
    onSuccess: async () => {
      toast.success(t('bots.broadcast.cancelled'))
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'broadcast'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const [type, setType] = useState('text')
  const [text, setText] = useState('')
  const [media, setMedia] = useState('')
  const [segment, setSegment] = useState('all')

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {q.isLoading ? <FormSettingsSkeleton cards={2} fieldsPerCard={3} /> : null}
      {q.isError && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
      {q.data && (
        <>
          <section className="rounded-lg border border-border p-4 text-sm">
            <h3 className="font-medium">{t('bots.broadcast.status')}</h3>
            {q.data.job && (q.data.job as { active?: boolean }).active ? (
              <div className="mt-2 space-y-2">
                <StatusBadge status="active" tone="warning" />
                <KeyValueList
                  rows={Object.entries(q.data.job)
                    .filter(([k]) => k !== 'payload')
                    .slice(0, 12)
                    .map(([k, v]) => ({
                      label: k,
                      value: typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '—'),
                    }))}
                />
              </div>
            ) : (
              <p className="mt-2 text-muted-foreground">{t('bots.broadcast.idle')}</p>
            )}
            {(q.data.job as { active?: boolean } | null)?.active && (
              <Button type="button" className="mt-3" variant="destructive" size="sm" disabled={cancel.isPending} onClick={() => void cancel.mutateAsync()}>
                {t('bots.broadcast.cancelJob')}
              </Button>
            )}
          </section>

          {(!q.data.job || !(q.data.job as { active?: boolean }).active) && (
            <form
              className="space-y-4 rounded-lg border border-border p-4"
              onSubmit={(e) => {
                e.preventDefault()
                void start.mutateAsync({ type, text, media, segment })
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="bc-type">{t('bots.broadcast.type')}</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="bc-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">{t('bots.broadcast.types.text')}</SelectItem>
                    <SelectItem value="photo">{t('bots.broadcast.types.photo')}</SelectItem>
                    <SelectItem value="video">{t('bots.broadcast.types.video')}</SelectItem>
                    <SelectItem value="voice">{t('bots.broadcast.types.voice')}</SelectItem>
                    <SelectItem value="document">{t('bots.broadcast.types.document')}</SelectItem>
                  </SelectContent>
                </Select>
                {!q.data.advanced_media && type !== 'text' && (
                  <p className="text-xs text-muted-foreground">{t('bots.broadcast.mediaPlanHint')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bc-segment">{t('bots.broadcast.segment', 'سگمنت مخاطبان')}</Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger id="bc-segment" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('bots.broadcast.segments.all', 'همه')}</SelectItem>
                    <SelectItem value="buyers">{t('bots.broadcast.segments.buyers', 'خریداران')}</SelectItem>
                    <SelectItem value="never_bought">{t('bots.broadcast.segments.neverBought', 'هرگز خرید نکرده')}</SelectItem>
                    <SelectItem value="recent">{t('bots.broadcast.segments.recent', 'خریداران اخیر')}</SelectItem>
                    <SelectItem value="vip">{t('bots.broadcast.segments.vip', 'VIP')}</SelectItem>
                    <SelectItem value="inactive_30">{t('bots.broadcast.segments.inactive30', 'غیرفعال ۳۰ روز')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bc-text">{t('bots.broadcast.text')}</Label>
                <Textarea id="bc-text" required className="min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bc-media">{t('bots.broadcast.media')}</Label>
                <Input id="bc-media" className="font-mono text-sm" value={media} onChange={(e) => setMedia(e.target.value)} />
              </div>
              <Button type="submit" disabled={start.isPending}>
                {t('bots.broadcast.start')}
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
