import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer } from '@/components/settings/WcSettingsFormRenderer'
import type { ShippingZoneRow, WcSettingsField } from '@/components/settings/wc-settings-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { getSsrPage } from '@/lib/ssrPage'

type ShippingResponse = {
  zones: ShippingZoneRow[]
  global: { fields: WcSettingsField[]; values: Record<string, unknown> } | null
}

export function ShippingZonesPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [globalDraft, setGlobalDraft] = useState<Record<string, unknown>>({})
  const initial = useMemo(() => getSsrPage()?.shippingZones as ShippingResponse | undefined, [])

  const q = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => apiFetch<ShippingResponse>('shop/shipping/zones'),
    initialData: initial,
    staleTime: initial ? 90_000 : undefined,
    refetchOnMount: initial ? false : true,
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.global?.values) setGlobalDraft({ ...q.data.global.values })
  }, [q.data?.global?.values])

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['shipping-zones'] })

  const create = useMutation({
    mutationFn: () =>
      apiFetch('shop/shipping/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      }),
    onSuccess: () => {
      setNewName('')
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`shop/shipping/zones/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveGlobal = useMutation({
    mutationFn: () =>
      apiFetch('shop/wc-settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalDraft),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const zones = q.data?.zones ?? []
  const global = q.data?.global

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">{t('settings.shop.sections.shipping')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[12rem] flex-1"
              placeholder={t('settings.shop.shippingNewZone')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="button" size="sm" disabled={!newName.trim() || create.isPending} onClick={() => void create.mutateAsync()}>
              {t('settings.shop.shippingAddZone')}
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {zones.map((z) => (
              <li key={z.id}>
                <Card className="py-4 shadow-soft">
                  <CardContent className="flex items-center justify-between gap-2 px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <MapPin className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{z.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {t('settings.shop.shippingMethodCount', { count: z.method_count })}
                        </p>
                      </div>
                    </div>
                    {z.id > 0 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        disabled={remove.isPending}
                        onClick={() => void remove.mutateAsync(z.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {global ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.shop.shippingOptions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WcSettingsFormRenderer
              fields={global.fields}
              values={globalDraft}
              onChange={(id, value) => setGlobalDraft((d) => ({ ...d, [id]: value }))}
            />
            <Button type="button" disabled={saveGlobal.isPending} onClick={() => void saveGlobal.mutateAsync()}>
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
