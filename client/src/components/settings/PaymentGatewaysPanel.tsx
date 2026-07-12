import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer } from '@/components/settings/WcSettingsFormRenderer'
import type { PaymentGatewayRow } from '@/components/settings/wc-settings-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'

export function PaymentGatewaysPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [enabled, setEnabled] = useState(false)

  const q = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: () => apiFetch<{ gateways: PaymentGatewayRow[] }>('shop/payment-gateways'),
  })
  useQueryErrorToast(q)

  const gateways = q.data?.gateways ?? []
  const active = gateways.find((g) => g.id === activeId) ?? gateways[0]

  useEffect(() => {
    if (active) {
      setActiveId(active.id)
      setDraft({ ...active.settings })
      setEnabled(active.enabled)
    }
  }, [active?.id, q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`shop/payment-gateways/${active?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, settings: draft }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['payment-gateways'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!active) return null

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-wrap gap-1 lg:w-48 lg:flex-col">
        {gateways.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn(
              'rounded-md px-3 py-2 text-start text-sm',
              g.id === active.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
            )}
            onClick={() => setActiveId(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>
      <Card className="min-w-0 flex-1 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{active.title}</CardTitle>
          {active.description ? <p className="text-muted-foreground text-sm">{active.description}</p> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="gw-enabled" checked={enabled} onCheckedChange={(v) => setEnabled(v === true)} />
            <Label htmlFor="gw-enabled" className="cursor-pointer font-normal">
              {t('settings.shop.gatewayEnabled')}
            </Label>
          </div>
          <WcSettingsFormRenderer fields={active.fields} values={draft} onChange={(id, v) => setDraft((d) => ({ ...d, [id]: v }))} />
          <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
