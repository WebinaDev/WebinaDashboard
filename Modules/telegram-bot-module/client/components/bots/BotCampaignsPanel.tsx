import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { DateTimePicker } from '@/components/DateTimePicker'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'
import { translateBotCampaignStatus } from '@/lib/enumLabels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { BotProvider } from '@/types/bots'

type CampaignItem = {
  id: number
  name: string
  status: string
  scheduled_at: number
  sent: number
  failed: number
}

type CampaignsResponse = {
  enabled: boolean
  items: CampaignItem[]
}

export function BotCampaignsPanel({ provider }: { provider: BotProvider }) {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const base = `bots/${provider}`

  const q = useQuery({
    queryKey: ['bots', provider, 'campaigns'],
    queryFn: () => apiFetch<CampaignsResponse>(`${base}/campaigns`),
  })

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ ok: boolean; campaign_id?: number }>(`${base}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      toast.success(t('bots.campaigns.created'))
      await qc.invalidateQueries({ queryKey: ['bots', provider, 'campaigns'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const [name, setName] = useState('')
  const [scheduleUnix, setScheduleUnix] = useState<number | null>(null)
  const [type, setType] = useState('text')
  const [text, setText] = useState('')
  const [media, setMedia] = useState('')
  const [audience, setAudience] = useState<'all' | 'imported'>('all')

  if (q.isLoading) return <FormSettingsSkeleton cards={2} fieldsPerCard={4} />
  if (q.isError) return <p className="text-sm text-destructive">{t('errors.api.generic')}</p>
  const d = q.data!

  return (
    <div className="space-y-8">
      {!d.enabled && (
        <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground">
          {t('bots.campaigns.disabled')}
        </p>
      )}

      {d.enabled && (
        <form
          className="mx-auto max-w-xl space-y-4 rounded-lg border border-border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!scheduleUnix) return
            void create.mutateAsync({
              name,
              scheduled_at: scheduleUnix,
              type,
              text,
              media,
              audience,
            })
          }}
        >
          <div>
            <Label htmlFor="cp-name">{t('bots.campaigns.name')}</Label>
            <Input id="cp-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <DateTimePicker
            id="cp-when"
            label={t('bots.campaigns.schedule')}
            required
            value={scheduleUnix ?? undefined}
            onChange={setScheduleUnix}
          />
          <div className="space-y-2">
            <Label htmlFor="cp-type">{t('bots.broadcast.type')}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="cp-type" className="w-full">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-text">{t('bots.broadcast.text')}</Label>
            <Textarea id="cp-text" className="min-h-20" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cp-media">{t('bots.broadcast.media')}</Label>
            <Input id="cp-media" value={media} onChange={(e) => setMedia(e.target.value)} className="mt-1 font-mono text-sm" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t('bots.campaigns.audience')}</legend>
            <RadioGroup value={audience} onValueChange={(v) => setAudience(v as 'all' | 'imported')} className="gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="aud-all" />
                <Label htmlFor="aud-all" className="cursor-pointer font-normal">
                  {t('bots.campaigns.audienceAll')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="imported" id="aud-imp" />
                <Label htmlFor="aud-imp" className="cursor-pointer font-normal">
                  {t('bots.campaigns.audienceImported')}
                </Label>
              </div>
            </RadioGroup>
          </fieldset>
          <Button type="submit" disabled={create.isPending || scheduleUnix == null}>
            {t('bots.campaigns.submit')}
          </Button>
        </form>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold">{t('bots.campaigns.list')}</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th className="p-2">{t('bots.campaigns.colName')}</th>
                <th className="p-2">{t('bots.campaigns.colStatus')}</th>
                <th className="p-2">{t('bots.campaigns.colWhen')}</th>
                <th className="p-2">{t('bots.campaigns.colSent')}</th>
                <th className="p-2">{t('bots.campaigns.colFailed')}</th>
              </tr>
            </thead>
            <tbody>
              {d.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-muted-foreground">
                    {t('bots.campaigns.empty')}
                  </td>
                </tr>
              ) : (
                d.items.map((it) => (
                  <tr key={it.id} className="border-t border-border">
                    <td className="p-2">{it.name}</td>
                    <td className="p-2">{translateBotCampaignStatus(t, it.status)}</td>
                    <td className="p-2 text-xs">{formatDisplayDateTime(it.scheduled_at, i18n.language)}</td>
                    <td className="p-2">{it.sent}</td>
                    <td className="p-2">{it.failed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
