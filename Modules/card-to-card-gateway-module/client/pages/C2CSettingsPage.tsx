import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  GatewayField,
  GatewayFieldsGrid,
  GatewaySettingsLayout,
  GatewaySwitchRow,
  GatewayTextArea,
} from '@/components/payments/GatewaySettingsLayout'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  description?: string
  instructions: string
  order_button_text?: string
  icon_url?: string
  default_icon_url?: string
  resolved_icon_url?: string
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

  if (!draft) {
    return <PageShell title={t('c2c.title')}>{t('common.loading')}</PageShell>
  }

  return (
    <GatewaySettingsLayout
      title={t('c2c.title')}
      description={t('c2c.subtitle')}
      sections={[
        {
          id: 'checkout',
          title: t('gateway.section.checkout'),
          children: (
            <div className="space-y-4">
              <GatewaySwitchRow
                label={t('c2c.enabled')}
                description={t('c2c.enabledHint')}
                checked={draft.enabled}
                onChange={(v) => setDraft({ ...draft, enabled: v })}
              />
              <GatewayFieldsGrid>
                <GatewayField
                  label={t('c2c.checkoutTitle')}
                  value={draft.title}
                  onChange={(v) => setDraft({ ...draft, title: v })}
                />
                <GatewayField
                  label={t('gateway.field.orderButtonText')}
                  value={draft.order_button_text ?? ''}
                  onChange={(v) => setDraft({ ...draft, order_button_text: v })}
                />
                <GatewayField
                  label={t('c2c.deadline')}
                  type="number"
                  value={String(draft.deadline_h)}
                  onChange={(v) => setDraft({ ...draft, deadline_h: Number(v) || 1 })}
                  hint={t('c2c.deadlineHint')}
                />
                <GatewayTextArea
                  className="md:col-span-2"
                  label={t('gateway.field.description')}
                  value={draft.description ?? ''}
                  onChange={(v) => setDraft({ ...draft, description: v })}
                />
                <GatewayTextArea
                  className="md:col-span-2"
                  label={t('c2c.instructions')}
                  value={draft.instructions}
                  onChange={(v) => setDraft({ ...draft, instructions: v })}
                />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">{t('gateway.field.iconUrl')}</label>
                  <div className="flex items-start gap-3">
                    <img
                      src={draft.icon_url?.trim() || draft.resolved_icon_url || draft.default_icon_url || ''}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded border object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <GatewayField
                        label=""
                        value={draft.icon_url ?? ''}
                        onChange={(v) => setDraft({ ...draft, icon_url: v })}
                        hint={t('gateway.field.iconUrlHint')}
                      />
                    </div>
                  </div>
                </div>
                <GatewayField
                  className="md:col-span-2"
                  label={t('c2c.iban')}
                  value={draft.iban}
                  onChange={(v) => setDraft({ ...draft, iban: v })}
                />
              </GatewayFieldsGrid>
            </div>
          ),
        },
        {
          id: 'cards',
          title: t('c2c.cards'),
          description: t('c2c.cardsHint'),
          children: (
            <div className="space-y-3">
              {draft.cards.map((card, i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('c2c.cardNumber')}</Label>
                    <Input
                      value={card.number}
                      className="font-mono"
                      onChange={(e) => updateCard(i, { number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('c2c.cardName')}</Label>
                    <Input value={card.name} onChange={(e) => updateCard(i, { name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('c2c.cardBank')}</Label>
                    <Input value={card.bank} onChange={(e) => updateCard(i, { bank: e.target.value })} />
                  </div>
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
          ),
        },
      ]}
      actions={
        <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      }
    />
  )
}
