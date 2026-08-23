import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ProductMultiSelect } from '@/components/coupons/ProductMultiSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

import type { BlendGuideItem, BlendIdLabel, BlendSuggestion, CoffeeBlendSettings } from '../types'

export function CoffeeBlendSettingsPanel() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<CoffeeBlendSettings | null>(null)

  const q = useQuery({
    queryKey: ['coffee-blend-settings'],
    queryFn: () => apiFetch<{ settings: CoffeeBlendSettings }>('shop/coffee-blend/settings'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.settings) setDraft(q.data.settings)
  }, [q.data])

  const save = useMutation({
    mutationFn: (settings: CoffeeBlendSettings) =>
      apiFetch<{ settings: CoffeeBlendSettings }>('shop/coffee-blend/settings', {
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

  if (!draft) {
    return <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
  }

  function setList(key: 'roasts' | 'grind_devices', next: BlendIdLabel[]) {
    setDraft((d) => (d ? { ...d, [key]: next } : d))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" size="sm" disabled={save.isPending} onClick={() => void save.mutateAsync(draft)}>
          {t('common.save')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.blendSectionCatalog')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <p className="text-muted-foreground md:col-span-2 text-sm">{t('coffeeProfile.blendShortcodeHint')}</p>
          <p className="text-muted-foreground md:col-span-2 text-sm">{t('coffeeProfile.searchShortcodeHint')}</p>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendSource')}</Label>
            <Select value={draft.source} onValueChange={(v) => setDraft({ ...draft, source: v as CoffeeBlendSettings['source'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">{t('coffeeProfile.blendSourceProfile')}</SelectItem>
                <SelectItem value="category">{t('coffeeProfile.blendSourceCategory')}</SelectItem>
                <SelectItem value="products">{t('coffeeProfile.blendSourceProducts')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendMode')}</Label>
            <Select value={draft.default_mode} onValueChange={(v) => setDraft({ ...draft, default_mode: v as CoffeeBlendSettings['default_mode'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">{t('coffeeProfile.blendModeBoth')}</SelectItem>
                <SelectItem value="simple">{t('coffeeProfile.blendModeSimple')}</SelectItem>
                <SelectItem value="advanced">{t('coffeeProfile.blendModeAdvanced')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {draft.source === 'category' ? (
            <div className="space-y-2 md:col-span-2">
              <Label>{t('coffeeProfile.blendCategoryIds')}</Label>
              <Input
                value={draft.category_ids.join(', ')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category_ids: e.target.value
                      .split(/[,\s]+/)
                      .map((x) => Number(x))
                      .filter((n) => n > 0),
                  })
                }
              />
            </div>
          ) : null}
          {draft.source === 'products' ? (
            <div className="md:col-span-2">
              <ProductMultiSelect
                id="blend-products"
                label={t('coffeeProfile.blendProductIds')}
                value={draft.product_ids}
                onChange={(ids) => setDraft({ ...draft, product_ids: ids })}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendMinBeans')}</Label>
            <Input type="number" min={1} value={draft.min_beans} onChange={(e) => setDraft({ ...draft, min_beans: Number(e.target.value) || 1 })} />
          </div>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendMaxBeans')}</Label>
            <Input type="number" min={1} value={draft.max_beans} onChange={(e) => setDraft({ ...draft, max_beans: Number(e.target.value) || 2 })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.blendSectionPrice')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendPriceBasis')}</Label>
            <Select value={draft.price_basis} onValueChange={(v) => setDraft({ ...draft, price_basis: v as CoffeeBlendSettings['price_basis'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_kg">{t('coffeeProfile.blendPricePerKg')}</SelectItem>
                <SelectItem value="pack">{t('coffeeProfile.blendPricePack')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendDefaultPack')}</Label>
            <Input
              type="number"
              value={draft.default_pack_weight_g}
              onChange={(e) => setDraft({ ...draft, default_pack_weight_g: Number(e.target.value) || 1000 })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendGrindFee')}</Label>
            <Input type="number" value={draft.grind_fee} onChange={(e) => setDraft({ ...draft, grind_fee: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendWeights')}</Label>
            <Input
              value={draft.weights.join(', ')}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  weights: e.target.value
                    .split(/[,\s]+/)
                    .map((x) => Number(x))
                    .filter((n) => n >= 10),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('coffeeProfile.blendHolder')}</Label>
            <Input type="number" value={draft.holder_product_id || ''} onChange={(e) => setDraft({ ...draft, holder_product_id: Number(e.target.value) || 0 })} />
            <p className="text-muted-foreground text-xs">{t('coffeeProfile.blendHolderHint')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('coffeeProfile.blendSectionSimple')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <ProductMultiSelect
            id="blend-robusta"
            label={t('coffeeProfile.blendRobustaProduct')}
            value={draft.robusta_product_id ? [draft.robusta_product_id] : []}
            onChange={(ids) => setDraft({ ...draft, robusta_product_id: ids[ids.length - 1] ?? 0 })}
          />
          <ProductMultiSelect
            id="blend-arabica"
            label={t('coffeeProfile.blendArabicaProduct')}
            value={draft.arabica_product_id ? [draft.arabica_product_id] : []}
            onChange={(ids) => setDraft({ ...draft, arabica_product_id: ids[ids.length - 1] ?? 0 })}
          />
        </CardContent>
      </Card>

      <IdLabelEditor title={t('coffeeProfile.blendRoasts')} items={draft.roasts} onChange={(next) => setList('roasts', next)} />
      <IdLabelEditor title={t('coffeeProfile.blendDevices')} items={draft.grind_devices} onChange={(next) => setList('grind_devices', next)} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('coffeeProfile.blendSuggestions')}</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setDraft({
                ...draft,
                suggestions: [...draft.suggestions, { id: `s_${Date.now()}`, label: '', arabica: 80, robusta: 20, hint: '' }],
              })
            }
          >
            <Plus className="size-4" />
            {t('coffeeProfile.addLevel')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {draft.suggestions.map((row, i) => (
            <div key={`${row.id}-${i}`} className="grid gap-2 md:grid-cols-5">
              <Input value={row.label} placeholder={t('coffeeProfile.blendSuggestLabel')} onChange={(e) => patchSuggestion(i, { label: e.target.value })} />
              <Input type="number" value={row.arabica} onChange={(e) => patchSuggestion(i, { arabica: Number(e.target.value) || 0 })} />
              <Input type="number" value={row.robusta} onChange={(e) => patchSuggestion(i, { robusta: Number(e.target.value) || 0 })} />
              <Input className="md:col-span-2" value={row.hint} placeholder={t('coffeeProfile.blendSuggestHint')} onChange={(e) => patchSuggestion(i, { hint: e.target.value })} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('coffeeProfile.blendGuide')}</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDraft({ ...draft, guide: [...draft.guide, { title: '', body: '' }] })}
          >
            <Plus className="size-4" />
            {t('coffeeProfile.addLevel')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {draft.guide.map((row, i) => (
            <div key={`g-${i}`} className="space-y-2 rounded-md border p-3">
              <div className="flex gap-2">
                <Input value={row.title} onChange={(e) => patchGuide(i, { title: e.target.value })} />
                <Button type="button" size="icon" variant="ghost" onClick={() => setDraft({ ...draft, guide: draft.guide.filter((_, j) => j !== i) })}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <textarea
                className="border-input min-h-20 w-full rounded-md border bg-transparent p-2 text-sm"
                value={row.body}
                onChange={(e) => patchGuide(i, { body: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  function patchSuggestion(index: number, patch: Partial<BlendSuggestion>) {
    setDraft((d) => {
      if (!d) return d
      return { ...d, suggestions: d.suggestions.map((row, i) => (i === index ? { ...row, ...patch } : row)) }
    })
  }

  function patchGuide(index: number, patch: Partial<BlendGuideItem>) {
    setDraft((d) => {
      if (!d) return d
      return { ...d, guide: d.guide.map((row, i) => (i === index ? { ...row, ...patch } : row)) }
    })
  }
}

function IdLabelEditor({
  title,
  items,
  onChange,
}: {
  title: string
  items: BlendIdLabel[]
  onChange: (next: BlendIdLabel[]) => void
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...items, { id: `item_${Date.now()}`, label: '' }])}>
          <Plus className="size-4" />
          {t('coffeeProfile.addLevel')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((row, i) => (
          <div key={`${row.id}-${i}`} className="flex gap-2">
            <Input className="max-w-[9rem] font-mono text-xs" value={row.id} onChange={(e) => onChange(items.map((r, j) => (j === i ? { ...r, id: e.target.value } : r)))} />
            <Input className="flex-1" value={row.label} onChange={(e) => onChange(items.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))} />
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
