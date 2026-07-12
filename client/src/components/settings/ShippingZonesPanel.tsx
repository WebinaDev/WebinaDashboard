import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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

type ShippingResponse = {
  zones: ShippingZoneRow[]
  global: { fields: WcSettingsField[]; values: Record<string, unknown> } | null
}

export function ShippingZonesPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [globalDraft, setGlobalDraft] = useState<Record<string, unknown>>({})

  const q = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => apiFetch<ShippingResponse>('shop/shipping/zones'),
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
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t('settings.shop.sections.shipping')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-xs"
              placeholder={t('settings.shop.shippingNewZone')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="button" size="sm" disabled={!newName.trim() || create.isPending} onClick={() => void create.mutateAsync()}>
              {t('settings.shop.shippingAddZone')}
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-md border border-border">
            {zones.map((z) => (
              <li key={z.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <span>
                  {z.name}
                  <span className="text-muted-foreground ms-2 text-xs">
                    {t('settings.shop.shippingMethodCount', { count: z.method_count })}
                  </span>
                </span>
                {z.id > 0 ? (
                  <Button type="button" size="icon" variant="ghost" className="size-8" disabled={remove.isPending} onClick={() => void remove.mutateAsync(z.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {global ? (
        <Card className="shadow-sm">
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
