import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type MapSettings = {
  enabled: boolean
  provider: string
  neshan_api_key: string
  mapp_api_key: string
  ors_token: string
  checkout_placement: string
  required_location: boolean
  store_location: { lat: number; lng: number }
  store_marker_enable: boolean
  distance_mode: string
}

export default function MapSettingsPage() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<MapSettings | null>(null)
  const q = useQuery({
    queryKey: ['shipping-map'],
    queryFn: () => apiFetch<{ settings: MapSettings }>('shipping/map/settings'),
  })
  useQueryErrorToast(q)
  useEffect(() => {
    if (q.data?.settings) setDraft(q.data.settings)
  }, [q.data])
  const save = useMutation({
    mutationFn: (settings: MapSettings) =>
      apiFetch('shipping/map/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })
  if (!draft) {
    return (
      <PageShell title={t('shipping.mapTitle')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }
  return (
    <PageShell title={t('shipping.mapTitle')} description={t('shipping.mapHint')}>
      <div className="mb-4 flex justify-end">
        <Button disabled={save.isPending} onClick={() => save.mutate(draft)}>{t('common.save')}</Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t('shipping.mapTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.mapEnabled')}</span>
            <Switch checked={draft.enabled} onCheckedChange={(v) => setDraft({ ...draft, enabled: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.mapRequired')}</span>
            <Switch checked={draft.required_location} onCheckedChange={(v) => setDraft({ ...draft, required_location: v })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('shipping.mapProvider')}</Label>
              <Select value={draft.provider} onValueChange={(v) => setDraft({ ...draft, provider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="osm">OpenStreetMap</SelectItem>
                  <SelectItem value="neshan">Neshan</SelectItem>
                  <SelectItem value="mapp">Map.ir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.mapPlacement')}</Label>
              <Select value={draft.checkout_placement} onValueChange={(v) => setDraft({ ...draft, checkout_placement: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="after_order_notes">{t('shipping.mapAfterNotes')}</SelectItem>
                  <SelectItem value="before_customer_details">{t('shipping.mapBeforeDetails')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.mapDistance')}</Label>
              <Select value={draft.distance_mode} onValueChange={(v) => setDraft({ ...draft, distance_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('shipping.mapDistNone')}</SelectItem>
                  <SelectItem value="direct">{t('shipping.mapDistDirect')}</SelectItem>
                  <SelectItem value="real">{t('shipping.mapDistReal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Neshan API</Label>
              <Input dir="ltr" value={draft.neshan_api_key} onChange={(e) => setDraft({ ...draft, neshan_api_key: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Map.ir API</Label>
              <Input dir="ltr" value={draft.mapp_api_key} onChange={(e) => setDraft({ ...draft, mapp_api_key: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>ORS Token</Label>
              <Input dir="ltr" value={draft.ors_token} onChange={(e) => setDraft({ ...draft, ors_token: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.storeLat')}</Label>
              <Input type="number" dir="ltr" value={draft.store_location.lat} onChange={(e) => setDraft({ ...draft, store_location: { ...draft.store_location, lat: parseFloat(e.target.value) || 0 } })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('shipping.storeLng')}</Label>
              <Input type="number" dir="ltr" value={draft.store_location.lng} onChange={(e) => setDraft({ ...draft, store_location: { ...draft.store_location, lng: parseFloat(e.target.value) || 0 } })} />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
