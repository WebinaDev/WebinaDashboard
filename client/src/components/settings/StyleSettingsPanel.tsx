import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Coffee, FileText, ImageIcon, Palette, ShieldAlert, Smartphone, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { DocumentLogoField } from '@/components/settings/DocumentLogoField'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { ACCENT_MENU_ITEMS, ACCENT_SWATCH, isBusinessAccent, normalizeAccent, type AccentPreset } from '@/lib/accent'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'

type BrandColors = {
  primary: string
  secondary: string
  accent: string
  bg: string
  surface: string
  text: string
  muted: string
}

type BrandFonts = {
  body: 'yekanbakh' | 'system'
  heading: 'yekanbakh' | 'system'
  ui: 'yekanbakh' | 'system'
}

type GeoColors = {
  overlay: string
  dialog: string
  title: string
  text: string
  button: string
  button_text: string
}

type StyleSettings = {
  accent: string
  colors: BrandColors
  logo_id: number
  favicon_id: number
  fonts: BrandFonts
  logo_url?: string
  favicon_url?: string
  geo_notice?: { colors: GeoColors } | null
  wfcp?: Record<string, string | number> | null
  wfcp_available?: boolean
  pwa?: { theme_color: string; background_color: string } | null
  order_documents?: {
    accent_color: string
    logo_url: string
    invoice_logo_id: number
    invoice_logo_url: string
    receipt_logo_id: number
    receipt_logo_url: string
    label_logo_id: number
    label_logo_url: string
  } | null
  coffee_profile?: {
    colors: Record<string, string>
    font_title: number
    font_label: number
    font_value: number
    radius: number
    gap: number
    bar_height: number
    stroke_width: number
  } | null
  coffee_available?: boolean
}

const BRAND_COLOR_KEYS: (keyof BrandColors)[] = [
  'primary',
  'secondary',
  'accent',
  'bg',
  'surface',
  'text',
  'muted',
]

const GEO_COLOR_KEYS: (keyof GeoColors)[] = [
  'overlay',
  'dialog',
  'title',
  'text',
  'button',
  'button_text',
]

const WFCP_COLOR_FIELDS: Array<[string, string]> = [
  ['box_background', '#ffffff'],
  ['box_border_color', '#e0e0e0'],
  ['button_background', '#2271b1'],
  ['button_text_color', '#ffffff'],
  ['price_color', '#2271b1'],
  ['alert_bg', '#ffffff'],
  ['alert_text_color', '#9A3412'],
  ['alert_border_color', '#FDBA74'],
  ['alert_accent', '#EA580C'],
  ['badge_cash_bg', '#ECFDF5'],
  ['badge_cash_text', '#047857'],
  ['badge_credit_bg', '#EFF6FF'],
  ['badge_credit_text', '#1D4ED8'],
  ['badge_installment_bg', '#FFFBEB'],
  ['badge_installment_text', '#B45309'],
  ['timeline_dot', '#c45c26'],
  ['timeline_line', '#d6b089'],
  ['timeline_today_text', '#111827'],
  ['timeline_future_text', '#6b7280'],
]

const COFFEE_COLOR_KEYS = [
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
] as const

const FONT_SLOTS: (keyof BrandFonts)[] = ['body', 'heading', 'ui']

const DEFAULT_GEO_COLORS: GeoColors = {
  overlay: '#0f172a',
  dialog: '#ffffff',
  title: '#0f172a',
  text: '#334155',
  button: '#0f172a',
  button_text: '#ffffff',
}

function defaultWfcp(): Record<string, string | number> {
  const out: Record<string, string | number> = { border_radius: 8 }
  for (const [k, fb] of WFCP_COLOR_FIELDS) out[k] = fb
  return out
}

function defaultCoffee() {
  return {
    colors: {
      card_bg: '#f7f3ee',
      card_text: '#3d2b1f',
      card_border: '#e2d5c5',
      track: '#e8ddd0',
      blend_fill: '#6b4f3a',
      acidity_line: '#8b6914',
      acidity_dot: '#c45c26',
      caffeine_fill: '#4a3728',
      bitterness_fill: '#5c4033',
      sweetness_fill: '#c17f3a',
      body_fill: '#7a5c45',
      label: '#6b5b4f',
      value: '#3d2b1f',
    },
    font_title: 16,
    font_label: 12,
    font_value: 13,
    radius: 16,
    gap: 20,
    bar_height: 10,
    stroke_width: 2,
  }
}

const DEFAULTS: StyleSettings = {
  accent: 'colorful',
  colors: {
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#e11d48',
    bg: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
  },
  logo_id: 0,
  favicon_id: 0,
  fonts: { body: 'yekanbakh', heading: 'yekanbakh', ui: 'yekanbakh' },
  logo_url: '',
  favicon_url: '',
  geo_notice: { colors: { ...DEFAULT_GEO_COLORS } },
  wfcp: defaultWfcp(),
  wfcp_available: false,
  pwa: { theme_color: '#0f172a', background_color: '#ffffff' },
  order_documents: {
    accent_color: '#e775ae',
    logo_url: '',
    invoice_logo_id: 0,
    invoice_logo_url: '',
    receipt_logo_id: 0,
    receipt_logo_url: '',
    label_logo_id: 0,
    label_logo_url: '',
  },
  coffee_profile: defaultCoffee(),
  coffee_available: false,
}

function toDraft(data: StyleSettings): StyleSettings {
  const wfcpBase = defaultWfcp()
  if (data.wfcp && typeof data.wfcp === 'object') {
    for (const k of Object.keys(wfcpBase)) {
      if (data.wfcp[k] !== undefined && data.wfcp[k] !== null) wfcpBase[k] = data.wfcp[k] as string | number
    }
  }
  const coffeeBase = defaultCoffee()
  if (data.coffee_profile) {
    coffeeBase.colors = { ...coffeeBase.colors, ...(data.coffee_profile.colors || {}) }
    coffeeBase.font_title = Number(data.coffee_profile.font_title) || coffeeBase.font_title
    coffeeBase.font_label = Number(data.coffee_profile.font_label) || coffeeBase.font_label
    coffeeBase.font_value = Number(data.coffee_profile.font_value) || coffeeBase.font_value
    coffeeBase.radius = Number(data.coffee_profile.radius) || coffeeBase.radius
    coffeeBase.gap = Number(data.coffee_profile.gap) || coffeeBase.gap
    coffeeBase.bar_height = Number(data.coffee_profile.bar_height) || coffeeBase.bar_height
    coffeeBase.stroke_width = Number(data.coffee_profile.stroke_width) || coffeeBase.stroke_width
  }
  const docs = data.order_documents
  return {
    accent: normalizeAccent(data.accent),
    colors: { ...DEFAULTS.colors, ...(data.colors || {}) },
    logo_id: Number(data.logo_id) || 0,
    favicon_id: Number(data.favicon_id) || 0,
    fonts: {
      body: data.fonts?.body === 'system' ? 'system' : 'yekanbakh',
      heading: data.fonts?.heading === 'system' ? 'system' : 'yekanbakh',
      ui: data.fonts?.ui === 'system' ? 'system' : 'yekanbakh',
    },
    logo_url: String(data.logo_url ?? ''),
    favicon_url: String(data.favicon_url ?? ''),
    geo_notice: {
      colors: { ...DEFAULT_GEO_COLORS, ...(data.geo_notice?.colors || {}) },
    },
    wfcp: wfcpBase,
    wfcp_available: !!data.wfcp_available,
    pwa: {
      theme_color: String(data.pwa?.theme_color || '#0f172a'),
      background_color: String(data.pwa?.background_color || '#ffffff'),
    },
    order_documents: {
      accent_color: String(docs?.accent_color || '#e775ae'),
      logo_url: String(docs?.logo_url || ''),
      invoice_logo_id: Number(docs?.invoice_logo_id) || 0,
      invoice_logo_url: String(docs?.invoice_logo_url || ''),
      receipt_logo_id: Number(docs?.receipt_logo_id) || 0,
      receipt_logo_url: String(docs?.receipt_logo_url || ''),
      label_logo_id: Number(docs?.label_logo_id) || 0,
      label_logo_url: String(docs?.label_logo_url || ''),
    },
    coffee_profile: coffeeBase,
    coffee_available: !!data.coffee_available,
  }
}

function applyFontsToDocument(fonts: BrandFonts) {
  const map = (k: BrandFonts[keyof BrandFonts]) =>
    k === 'system'
      ? "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"
      : "'Yekan Bakh',Tahoma,sans-serif"
  const el = document.documentElement
  el.style.setProperty('--wd-font-body', map(fonts.body))
  el.style.setProperty('--wd-font-heading', map(fonts.heading))
  el.style.setProperty('--wd-font-ui', map(fonts.ui))
}

function ColorRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer p-1"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 font-mono text-sm" />
      </div>
    </div>
  )
}

export function StyleSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<StyleSettings | null>(null)

  const q = useQuery({
    queryKey: ['settings', 'style'],
    queryFn: () => apiFetch<StyleSettings>('settings/style'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (!q.data) return
    const next = toDraft(q.data)
    setDraft(next)
    applyFontsToDocument(next.fonts)
    document.documentElement.setAttribute('data-accent', normalizeAccent(next.accent))
  }, [q.data])

  const save = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error('No draft')
      const body: Record<string, unknown> = {
        accent: draft.accent,
        colors: draft.colors,
        logo_id: draft.logo_id,
        favicon_id: draft.favicon_id,
        fonts: draft.fonts,
        geo_notice: draft.geo_notice,
        pwa: draft.pwa,
        order_documents: draft.order_documents,
      }
      if (draft.wfcp_available) body.wfcp = draft.wfcp
      if (draft.coffee_available) body.coffee_profile = draft.coffee_profile
      return apiFetch<StyleSettings>('settings/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: (data) => {
      const next = toDraft(data)
      qc.setQueryData(['settings', 'style'], data)
      setDraft(next)
      applyFontsToDocument(next.fonts)
      document.documentElement.setAttribute('data-accent', normalizeAccent(next.accent))
      void qc.invalidateQueries({ queryKey: ['bootstrap'] })
      void qc.invalidateQueries({ queryKey: ['settings', 'pwa'] })
      void qc.invalidateQueries({ queryKey: ['payments-hub'] })
      void qc.invalidateQueries({ queryKey: ['shop', 'settings', 'invoices'] })
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (q.isLoading) return <FormSettingsSkeleton />
  if (q.isError) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!draft) return null

  return (
    <div className="space-y-6">
      <Card variant="hero">
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
            <Palette className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-base">{t('settings.style.accentTitle')}</CardTitle>
          <CardDescription>{t('settings.style.accentHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ACCENT_MENU_ITEMS.map((item) => {
              const a = item.value as AccentPreset
              const themed = isBusinessAccent(a)
              return (
                <button
                  key={a}
                  type="button"
                  title={t(item.labelKey)}
                  aria-label={t(item.labelKey)}
                  className={cn(
                    'size-8 rounded-full border-2 transition-transform',
                    draft.accent === a ? 'border-foreground scale-110' : 'border-transparent',
                    themed && draft.accent !== a && 'ring-1 ring-border/60',
                  )}
                  style={{ background: ACCENT_SWATCH[a] }}
                  onClick={() => {
                    setDraft({ ...draft, accent: a })
                    document.documentElement.setAttribute('data-accent', a)
                  }}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.style.colorsTitle')}</CardTitle>
          <CardDescription>{t('settings.style.colorsHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {BRAND_COLOR_KEYS.map((key) => (
              <ColorRow
                key={key}
                id={`style-color-${key}`}
                label={t(`settings.style.color.${key}`)}
                value={draft.colors[key]}
                onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, [key]: v } })}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
            <ImageIcon className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-base">{t('settings.style.brandingTitle')}</CardTitle>
          <CardDescription>{t('settings.style.brandingHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <DocumentLogoField
            label={t('settings.style.logo')}
            hint={t('settings.style.logoHint')}
            imageId={draft.logo_id}
            imageUrl={draft.logo_url || ''}
            onChange={(next) => setDraft({ ...draft, logo_id: next.id, logo_url: next.url })}
            onRemove={() => setDraft({ ...draft, logo_id: 0, logo_url: '' })}
          />
          <DocumentLogoField
            label={t('settings.style.favicon')}
            hint={t('settings.style.faviconHint')}
            imageId={draft.favicon_id}
            imageUrl={draft.favicon_url || ''}
            onChange={(next) => setDraft({ ...draft, favicon_id: next.id, favicon_url: next.url })}
            onRemove={() => setDraft({ ...draft, favicon_id: 0, favicon_url: '' })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
            <Type className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-base">{t('settings.style.fontsTitle')}</CardTitle>
          <CardDescription>{t('settings.style.fontsHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {FONT_SLOTS.map((slot) => (
            <div key={slot} className="space-y-2">
              <Label>{t(`settings.style.font.${slot}`)}</Label>
              <Select
                value={draft.fonts[slot]}
                onValueChange={(v) => {
                  const fonts = {
                    ...draft.fonts,
                    [slot]: v === 'system' ? 'system' : 'yekanbakh',
                  } as BrandFonts
                  setDraft({ ...draft, fonts })
                  applyFontsToDocument(fonts)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yekanbakh">{t('settings.style.fontYekan')}</SelectItem>
                  <SelectItem value="system">{t('settings.style.fontSystem')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {draft.geo_notice ? (
        <Card>
          <CardHeader>
            <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
              <ShieldAlert className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-base">{t('settings.style.geoTitle')}</CardTitle>
            <CardDescription>{t('settings.style.geoHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {GEO_COLOR_KEYS.map((key) => (
                <ColorRow
                  key={key}
                  id={`geo-color-${key}`}
                  label={t(`paymentsHub.geoColor.${key}`)}
                  value={draft.geo_notice!.colors[key]}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      geo_notice: { colors: { ...draft.geo_notice!.colors, [key]: v } },
                    })
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {draft.wfcp_available && draft.wfcp ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.style.wfcpTitle')}</CardTitle>
            <CardDescription>{t('settings.style.wfcpHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {WFCP_COLOR_FIELDS.map(([key, fb]) => (
                <ColorRow
                  key={key}
                  id={`wfcp-color-${key}`}
                  label={t(`wfcp.field.${key}`, key)}
                  value={String(draft.wfcp![key] ?? fb)}
                  onChange={(v) => setDraft({ ...draft, wfcp: { ...draft.wfcp!, [key]: v } })}
                />
              ))}
            </div>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="wfcp-radius">{t('wfcp.field.border_radius')}</Label>
              <Input
                id="wfcp-radius"
                type="number"
                value={Number(draft.wfcp.border_radius ?? 8)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    wfcp: { ...draft.wfcp!, border_radius: parseInt(e.target.value, 10) || 0 },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {draft.pwa ? (
        <Card>
          <CardHeader>
            <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
              <Smartphone className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-base">{t('settings.style.pwaTitle')}</CardTitle>
            <CardDescription>{t('settings.style.pwaHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorRow
                id="pwa-theme"
                label={t('settings.pwa.fieldThemeColor')}
                value={draft.pwa.theme_color}
                onChange={(v) => setDraft({ ...draft, pwa: { ...draft.pwa!, theme_color: v } })}
              />
              <ColorRow
                id="pwa-bg"
                label={t('settings.pwa.fieldBackgroundColor')}
                value={draft.pwa.background_color}
                onChange={(v) => setDraft({ ...draft, pwa: { ...draft.pwa!, background_color: v } })}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {draft.order_documents ? (
        <Card>
          <CardHeader>
            <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
              <FileText className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-base">{t('settings.style.docsTitle')}</CardTitle>
            <CardDescription>{t('settings.style.docsHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ColorRow
              id="od-accent"
              label={t('settings.odAccentColor')}
              value={draft.order_documents.accent_color}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  order_documents: { ...draft.order_documents!, accent_color: v },
                })
              }
            />
            <div className="grid gap-6 sm:grid-cols-3">
              <DocumentLogoField
                label={t('settings.odInvoiceLogo')}
                imageId={draft.order_documents.invoice_logo_id}
                imageUrl={draft.order_documents.invoice_logo_url}
                onChange={(next) =>
                  setDraft({
                    ...draft,
                    order_documents: {
                      ...draft.order_documents!,
                      invoice_logo_id: next.id,
                      invoice_logo_url: next.url,
                    },
                  })
                }
                onRemove={() =>
                  setDraft({
                    ...draft,
                    order_documents: {
                      ...draft.order_documents!,
                      invoice_logo_id: 0,
                      invoice_logo_url: '',
                    },
                  })
                }
              />
              <DocumentLogoField
                label={t('settings.odReceiptLogo')}
                imageId={draft.order_documents.receipt_logo_id}
                imageUrl={draft.order_documents.receipt_logo_url}
                onChange={(next) =>
                  setDraft({
                    ...draft,
                    order_documents: {
                      ...draft.order_documents!,
                      receipt_logo_id: next.id,
                      receipt_logo_url: next.url,
                    },
                  })
                }
                onRemove={() =>
                  setDraft({
                    ...draft,
                    order_documents: {
                      ...draft.order_documents!,
                      receipt_logo_id: 0,
                      receipt_logo_url: '',
                    },
                  })
                }
              />
              <DocumentLogoField
                label={t('settings.odLabelLogo')}
                imageId={draft.order_documents.label_logo_id}
                imageUrl={draft.order_documents.label_logo_url}
                onChange={(next) =>
                  setDraft({
                    ...draft,
                    order_documents: {
                      ...draft.order_documents!,
                      label_logo_id: next.id,
                      label_logo_url: next.url,
                    },
                  })
                }
                onRemove={() =>
                  setDraft({
                    ...draft,
                    order_documents: {
                      ...draft.order_documents!,
                      label_logo_id: 0,
                      label_logo_url: '',
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {draft.coffee_available && draft.coffee_profile ? (
        <Card>
          <CardHeader>
            <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
              <Coffee className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-base">{t('settings.style.coffeeTitle')}</CardTitle>
            <CardDescription>{t('settings.style.coffeeHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {COFFEE_COLOR_KEYS.map((key) => (
                <ColorRow
                  key={key}
                  id={`coffee-color-${key}`}
                  label={t(`coffeeProfile.color.${key}`, key)}
                  value={draft.coffee_profile!.colors[key] || '#000000'}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      coffee_profile: {
                        ...draft.coffee_profile!,
                        colors: { ...draft.coffee_profile!.colors, [key]: v },
                      },
                    })
                  }
                />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ['font_title', 'coffeeProfile.fontTitle'],
                  ['font_label', 'coffeeProfile.fontLabel'],
                  ['font_value', 'coffeeProfile.fontValue'],
                  ['radius', 'coffeeProfile.radius'],
                  ['gap', 'coffeeProfile.gap'],
                  ['bar_height', 'coffeeProfile.barHeight'],
                  ['stroke_width', 'coffeeProfile.strokeWidth'],
                ] as const
              ).map(([key, labelKey]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`coffee-${key}`} className="text-xs">
                    {t(labelKey, key)}
                  </Label>
                  <Input
                    id={`coffee-${key}`}
                    type="number"
                    value={Number(draft.coffee_profile![key])}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        coffee_profile: {
                          ...draft.coffee_profile!,
                          [key]: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {save.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  )
}
