import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type C2CCard = {
  number: string
  name: string
  bank: string
}

type C2CSettings = {
  enabled: boolean
  title: string
  instructions: string
  iban: string
  deadline_h: number
  cards: C2CCard[]
}

const emptyCard = (): C2CCard => ({ number: '', name: '', bank: '' })

export default function C2CSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<C2CSettings | null>(null)

  const q = useQuery({
    queryKey: ['c2c', 'settings'],
    queryFn: () => apiFetch<{ settings: C2CSettings }>('c2c/settings'),
  })

  useEffect(() => {
    if (!q.data?.settings) return
    const s = q.data.settings
    setDraft({
      ...s,
      cards: s.cards?.length ? s.cards : [emptyCard()],
    })
  }, [q.data])

  const save = useMutation({
    mutationFn: async () =>
      apiFetch<{ settings: C2CSettings }>('c2c/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          cards: (draft?.cards ?? []).filter((c) => c.number.trim() !== ''),
        }),
      }),
    onSuccess: async (data) => {
      toast.success(t('common.saved'))
      if (data.settings) {
        setDraft({
          ...data.settings,
          cards: data.settings.cards?.length ? data.settings.cards : [emptyCard()],
        })
      }
      await qc.invalidateQueries({ queryKey: ['c2c', 'settings'] })
      await qc.invalidateQueries({ queryKey: ['payment-gateways'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const updateCard = (i: number, patch: Partial<C2CCard>) => {
    if (!draft) return
    const cards = draft.cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    setDraft({ ...draft, cards })
  }

  return (
    <PageShell title={t('c2c.title')} subtitle={t('c2c.subtitle')}>
      {!draft ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : (
        <div className="grid max-w-2xl gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="c2c-enabled"
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v === true })}
            />
            <Label htmlFor="c2c-enabled">{t('c2c.enabled')}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t('c2c.checkoutTitle')}</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('c2c.instructions')}</Label>
            <Textarea
              value={draft.instructions}
              onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('c2c.iban')}</Label>
            <Input
              value={draft.iban}
              onChange={(e) => setDraft({ ...draft, iban: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('c2c.deadline')}</Label>
            <Input
              type="number"
              min={1}
              max={72}
              value={draft.deadline_h}
              onChange={(e) => setDraft({ ...draft, deadline_h: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-3">
            <Label>{t('c2c.cards')}</Label>
            {draft.cards.map((card, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-3">
                <Input
                  placeholder={t('c2c.cardNumber')}
                  value={card.number}
                  className="font-mono"
                  onChange={(e) => updateCard(i, { number: e.target.value })}
                />
                <Input
                  placeholder={t('c2c.cardName')}
                  value={card.name}
                  onChange={(e) => updateCard(i, { name: e.target.value })}
                />
                <Input
                  placeholder={t('c2c.cardBank')}
                  value={card.bank}
                  onChange={(e) => updateCard(i, { bank: e.target.value })}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft({ ...draft, cards: [...draft.cards, emptyCard()] })}
            >
              {t('c2c.addCard')}
            </Button>
          </div>
          <div>
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
