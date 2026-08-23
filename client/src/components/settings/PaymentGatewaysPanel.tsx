import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer } from '@/components/settings/WcSettingsFormRenderer'
import type { PaymentGatewayRow } from '@/components/settings/wc-settings-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { getSsrPage } from '@/lib/ssrPage'
import { cn } from '@/lib/utils'

export function PaymentGatewaysPanel({ excludeIds = [] }: { excludeIds?: string[] }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [enabled, setEnabled] = useState(false)
  const initial = useMemo(() => getSsrPage()?.paymentGateways as { gateways: PaymentGatewayRow[] } | undefined, [])

  const q = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: () => apiFetch<{ gateways: PaymentGatewayRow[] }>('shop/payment-gateways'),
    initialData: initial,
    staleTime: initial ? 90_000 : undefined,
    refetchOnMount: initial ? false : true,
  })
  useQueryErrorToast(q)

  const gateways = (q.data?.gateways ?? []).filter((g) => !excludeIds.includes(g.id))
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

  if (!active) {
    return <p className="text-muted-foreground text-sm">{t('paymentsHub.noOther')}</p>
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 lg:w-56 lg:flex-col lg:overflow-visible lg:snap-none">
        {gateways.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn(
              'flex min-w-[10rem] shrink-0 snap-start flex-col gap-1 rounded-xl border px-3 py-3 text-start transition-colors lg:min-w-0',
              g.id === active.id ? 'border-primary/30 bg-primary/10' : 'hover:bg-muted/60',
            )}
            onClick={() => setActiveId(g.id)}
          >
            <span className="text-sm font-medium">{g.title}</span>
            {g.enabled ? (
              <Badge className="w-fit text-[10px]">{t('settings.enabled')}</Badge>
            ) : (
              <Badge variant="outline" className="w-fit text-[10px]">
                {t('settings.disabled')}
              </Badge>
            )}
          </button>
        ))}
      </div>
      <Card className="min-w-0 flex-1" variant="glass">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{active.title}</CardTitle>
            {active.description ? <p className="text-muted-foreground mt-1 text-sm">{active.description}</p> : null}
          </div>
          {enabled ? <Badge>{t('settings.enabled')}</Badge> : <Badge variant="secondary">{t('settings.disabled')}</Badge>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background/50 flex items-center gap-2 rounded-xl border px-3 py-3">
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
