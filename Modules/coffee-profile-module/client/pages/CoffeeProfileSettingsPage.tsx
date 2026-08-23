import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import { CoffeeBlendSettingsPanel } from '../components/CoffeeBlendSettingsPanel'
import { CoffeeProfilePreview } from '../components/CoffeeProfilePreview'
import type { AcidityLevel, CoffeeColors, CoffeeProfile, CoffeeSettings } from '../types'

const COLOR_KEYS: (keyof CoffeeColors)[] = [
  'card_bg',
  'card_text',
  'card_border',
  'track',
  'blend_fill',
  'acidity_line',
  'acidity_dot',
  'caffeine_fill',
  'bitterness_fill',
  'sweetness_fill',
  'body_fill',
  'label',
  'value',
]

function demoProfile(settings: CoffeeSettings): CoffeeProfile {
  const acidity: Record<string, number> = {}
  settings.acidity_levels.forEach((level, i) => {
    acidity[level.id] = Math.min(settings.scale_max, settings.scale_min + 2 + i)
  })
  return {
    blend_robusta: 70,
    blend_arabica: 30,
    acidity,
    caffeine_mg: 80,
    bitterness: Math.min(settings.scale_max, settings.scale_min + 6),
    sweetness: Math.min(settings.scale_max, settings.scale_min + 5),
    body: Math.min(settings.scale_max, settings.scale_min + 7),
    pack_weight_g: 1000,
    visible: {
      blend: true,
      acidity: true,
      caffeine: true,
      bitterness: true,
      sweetness: true,
      body: true,
      origin: true,
    },
    origin_ids: [],
    pack_weight_g: 1000,
  }
}

export default function CoffeeProfileSettingsPage() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<CoffeeSettings | null>(null)

  const q = useQuery({
    queryKey: ['coffee-profile-settings'],
    queryFn: () => apiFetch<{ settings: CoffeeSettings }>('shop/coffee-profile/settings'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.settings) setDraft(q.data.settings)
  }, [q.data])

  const save = useMutation({
    mutationFn: (settings: CoffeeSettings) =>
      apiFetch<{ settings: CoffeeSettings }>('shop/coffee-profile/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
    onSuccess: (data) => {
      toast.success(t('common.saved'))
      if (data.settings) setDraft(data.settings)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const preview = useMemo(() => (draft ? demoProfile(draft) : null), [draft])

  if (!draft) {
    return (
      <PageShell title={t('coffeeProfile.settingsTitle')}>
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </PageShell>
    )
  }

  function updateLevel(index: number, patch: Partial<AcidityLevel>) {
    setDraft((d) => {
      if (!d) return d
      const acidity_levels = d.acidity_levels.map((row, i) => (i === index ? { ...row, ...patch } : row))
      return { ...d, acidity_levels }
    })
  }

  function moveLevel(index: number, dir: -1 | 1) {
    setDraft((d) => {
      if (!d) return d
      const next = [...d.acidity_levels]
      const j = index + dir
      if (j < 0 || j >= next.length) return d
      const tmp = next[index]
      next[index] = next[j]
      next[j] = tmp
      return { ...d, acidity_levels: next }
    })
  }

  return (
    <PageShell title={t('coffeeProfile.settingsTitle')} description={t('coffeeProfile.settingsHint')}>
      <Tabs defaultValue="profile" className="gap-4">
        <TabsList>
          <TabsTrigger value="profile">{t('coffeeProfile.tabProfile')}</TabsTrigger>
          <TabsTrigger value="blend">{t('coffeeProfile.tabBlend')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
      <div className="mb-4 flex justify-end">
        <Button type="button" size="sm" disabled={save.isPending} onClick={() => void save.mutateAsync(draft)}>
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('coffeeProfile.sectionGeneral')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>{t('coffeeProfile.placement')}</Label>
                <Select value={draft.placement} onValueChange={(v) => setDraft({ ...draft, placement: v as CoffeeSettings['placement'] })}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">{t('coffeeProfile.placementSummary')}</SelectItem>
                    <SelectItem value="before_cart">{t('coffeeProfile.placementBeforeCart')}</SelectItem>
                    <SelectItem value="after_cart">{t('coffeeProfile.placementAfterCart')}</SelectItem>
                    <SelectItem value="before_tabs">{t('coffeeProfile.placementBeforeTabs')}</SelectItem>
                    <SelectItem value="after_tabs">{t('coffeeProfile.placementAfterTabs')}</SelectItem>
                    <SelectItem value="none">{t('coffeeProfile.placementNone')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="robusta-label">{t('coffeeProfile.robustaLabel')}</Label>
                <Input id="robusta-label" value={draft.robusta_label} onChange={(e) => setDraft({ ...draft, robusta_label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arabica-label">{t('coffeeProfile.arabicaLabel')}</Label>
                <Input id="arabica-label" value={draft.arabica_label} onChange={(e) => setDraft({ ...draft, arabica_label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caffeine-unit">{t('coffeeProfile.caffeineUnit')}</Label>
                <Input id="caffeine-unit" value={draft.caffeine_unit} onChange={(e) => setDraft({ ...draft, caffeine_unit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caffeine-max">{t('coffeeProfile.caffeineMax')}</Label>
                <Input
                  id="caffeine-max"
                  type="number"
                  min={1}
                  value={draft.caffeine_max}
                  onChange={(e) => setDraft({ ...draft, caffeine_max: Number(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale-min">{t('coffeeProfile.scaleMin')}</Label>
                <Input
                  id="scale-min"
                  type="number"
                  value={draft.scale_min}
                  onChange={(e) => setDraft({ ...draft, scale_min: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale-max">{t('coffeeProfile.scaleMax')}</Label>
                <Input
                  id="scale-max"
                  type="number"
                  value={draft.scale_max}
                  onChange={(e) => setDraft({ ...draft, scale_max: Number(e.target.value) || 1 })}
                />
              </div>
              <label className="flex items-center gap-2 md:col-span-2">
                <Checkbox checked={draft.use_flagcdn} onCheckedChange={(v) => setDraft({ ...draft, use_flagcdn: v === true })} />
                <span className="text-sm">{t('coffeeProfile.useFlagcdn')}</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('coffeeProfile.acidityLevels')}</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraft({
                    ...draft,
                    acidity_levels: [...draft.acidity_levels, { id: `level_${Date.now()}`, label: t('coffeeProfile.newLevel') }],
                  })
                }
              >
                <Plus className="size-4" />
                {t('coffeeProfile.addLevel')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {draft.acidity_levels.map((level, index) => (
                <div key={`${level.id}-${index}`} className="flex flex-wrap items-center gap-2">
                  <Input className="max-w-[8rem] font-mono text-xs" value={level.id} onChange={(e) => updateLevel(index, { id: e.target.value })} />
                  <Input className="min-w-[8rem] flex-1" value={level.label} onChange={(e) => updateLevel(index, { label: e.target.value })} />
                  <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => moveLevel(index, -1)} disabled={index === 0}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => moveLevel(index, 1)}
                    disabled={index === draft.acidity_levels.length - 1}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => setDraft({ ...draft, acidity_levels: draft.acidity_levels.filter((_, i) => i !== index) })}
                    disabled={draft.acidity_levels.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('coffeeProfile.sectionStyle')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {COLOR_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.colors[key]}
                    onChange={(e) => setDraft({ ...draft, colors: { ...draft.colors, [key]: e.target.value } })}
                    className="size-8 cursor-pointer rounded border bg-transparent"
                    aria-label={t(`coffeeProfile.color.${key}`)}
                  />
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs">{t(`coffeeProfile.color.${key}`)}</Label>
                    <Input
                      value={draft.colors[key]}
                      onChange={(e) => setDraft({ ...draft, colors: { ...draft.colors, [key]: e.target.value } })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
              {(
                [
                  ['font_title', 'fontTitle'],
                  ['font_label', 'fontLabel'],
                  ['font_value', 'fontValue'],
                  ['radius', 'radius'],
                  ['gap', 'gap'],
                  ['bar_height', 'barHeight'],
                  ['stroke_width', 'strokeWidth'],
                ] as const
              ).map(([key, labelKey]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`style-${key}`}>{t(`coffeeProfile.${labelKey}`)}</Label>
                  <Input
                    id={`style-${key}`}
                    type="number"
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="xl:sticky xl:top-4 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>{t('coffeeProfile.livePreview')}</CardTitle>
            </CardHeader>
            <CardContent>{preview ? <CoffeeProfilePreview settings={draft} profile={preview} /> : null}</CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>
        <TabsContent value="blend">
          <CoffeeBlendSettingsPanel />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
