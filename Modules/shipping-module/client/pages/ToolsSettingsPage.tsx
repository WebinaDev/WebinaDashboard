import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type ToolsSettings = {
  hide_when_free: boolean
  hide_when_courier: boolean
  default_product_weight_g: number
  default_package_weight_g: number
  post_weight_limit_kg: number
  status_enable: boolean
  free_shipping_title: string
  hide_country: boolean
  swap_state_city: boolean
  disable_default_method: boolean
  free_first_order: boolean
  honor_free_shipping_coupon: boolean
  method_images: Record<string, string>
}

const empty = (): ToolsSettings => ({
  hide_when_free: false,
  hide_when_courier: false,
  default_product_weight_g: 500,
  default_package_weight_g: 100,
  post_weight_limit_kg: 30,
  status_enable: true,
  free_shipping_title: '',
  hide_country: true,
  swap_state_city: false,
  disable_default_method: false,
  free_first_order: false,
  honor_free_shipping_coupon: true,
  method_images: {},
})

export default function ToolsSettingsPage() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<ToolsSettings | null>(null)
  const q = useQuery({
    queryKey: ['shipping-tools'],
    queryFn: () => apiFetch<{ settings: ToolsSettings }>('shipping/tools/settings'),
  })
  useQueryErrorToast(q)
  useEffect(() => {
    if (q.data?.settings) setDraft({ ...empty(), ...q.data.settings })
  }, [q.data])

  const save = useMutation({
    mutationFn: (settings: ToolsSettings) =>
      apiFetch('shipping/tools/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
    onSuccess: () => toast.success(t('common.saved')),
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft) {
    return (
      <PageShell title={t('shipping.toolsTitle')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  const imgKeys = [
    'webino_tapin_pishtaz',
    'webino_tapin_vip',
    'webino_tapin_tipax',
    'webino_courier',
    'webino_tapin_tipax_api',
    'webino_tapin_alonomic',
    'webino_flat_city',
  ]

  return (
    <PageShell title={t('shipping.toolsTitle')} description={t('shipping.toolsHint')}>
      <div className="mb-4 flex justify-end">
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate(draft)}>
          {t('common.save')}
        </Button>
      </div>
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.toolsRatesTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.hideWhenFree')}</span>
            <Switch checked={draft.hide_when_free} onCheckedChange={(v) => setDraft({ ...draft, hide_when_free: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.hideWhenCourier')}</span>
            <Switch checked={draft.hide_when_courier} onCheckedChange={(v) => setDraft({ ...draft, hide_when_courier: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.statusEnable')}</span>
            <Switch checked={draft.status_enable} onCheckedChange={(v) => setDraft({ ...draft, status_enable: v })} />
          </label>
        </CardContent>
      </Card>
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.toolsWeightTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t('shipping.defaultProductWeight')}</Label>
            <Input type="number" dir="ltr" value={draft.default_product_weight_g} onChange={(e) => setDraft({ ...draft, default_product_weight_g: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('shipping.defaultPackageWeight')}</Label>
            <Input type="number" dir="ltr" value={draft.default_package_weight_g} onChange={(e) => setDraft({ ...draft, default_package_weight_g: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('shipping.postWeightLimit')}</Label>
            <Input type="number" dir="ltr" value={draft.post_weight_limit_kg} onChange={(e) => setDraft({ ...draft, post_weight_limit_kg: Math.max(0, parseFloat(e.target.value) || 0) })} />
          </div>
        </CardContent>
      </Card>
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.proUxTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('shipping.freeShippingTitle')}</Label>
            <Input value={draft.free_shipping_title} onChange={(e) => setDraft({ ...draft, free_shipping_title: e.target.value })} />
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.hideCountry')}</span>
            <Switch checked={draft.hide_country} onCheckedChange={(v) => setDraft({ ...draft, hide_country: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.swapStateCity')}</span>
            <Switch checked={draft.swap_state_city} onCheckedChange={(v) => setDraft({ ...draft, swap_state_city: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.disableDefaultMethod')}</span>
            <Switch checked={draft.disable_default_method} onCheckedChange={(v) => setDraft({ ...draft, disable_default_method: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.freeFirstOrder')}</span>
            <Switch checked={draft.free_first_order} onCheckedChange={(v) => setDraft({ ...draft, free_first_order: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t('shipping.honorFreeCoupon')}</span>
            <Switch checked={draft.honor_free_shipping_coupon} onCheckedChange={(v) => setDraft({ ...draft, honor_free_shipping_coupon: v })} />
          </label>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.methodImagesTitle')}</CardTitle>
          <CardDescription>{t('shipping.methodImagesHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {imgKeys.map((key) => (
            <div key={key} className="space-y-1.5">
              <Label dir="ltr">{key}</Label>
              <Input
                dir="ltr"
                value={draft.method_images[key] || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    method_images: { ...draft.method_images, [key]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  )
}
