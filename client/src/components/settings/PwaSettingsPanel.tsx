import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { DocumentLogoField } from '@/components/settings/DocumentLogoField'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type PwaSettings = {
  enabled: boolean
  name: string
  short_name: string
  description: string
  theme_color: string
  background_color: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui'
  orientation: 'any' | 'portrait' | 'landscape'
  icon_source: 'site' | 'custom'
  icon_id: number
  show_install_banner: boolean
  splash_enabled: boolean
  resolved_name?: string
  resolved_short_name?: string
  resolved_description?: string
  icon_url?: string
  site_icon_url?: string
  custom_icon_url?: string
}

type Draft = Omit<
  PwaSettings,
  'resolved_name' | 'resolved_short_name' | 'resolved_description' | 'icon_url' | 'site_icon_url' | 'custom_icon_url'
> & {
  custom_icon_url: string
}

function toDraft(data: PwaSettings): Draft {
  return {
    enabled: !!data.enabled,
    name: String(data.name ?? ''),
    short_name: String(data.short_name ?? ''),
    description: String(data.description ?? ''),
    theme_color: String(data.theme_color || '#0f172a'),
    background_color: String(data.background_color || '#ffffff'),
    display: (data.display as Draft['display']) || 'standalone',
    orientation: (data.orientation as Draft['orientation']) || 'any',
    icon_source: data.icon_source === 'custom' ? 'custom' : 'site',
    icon_id: Number(data.icon_id) || 0,
    show_install_banner: data.show_install_banner !== false,
    splash_enabled: data.splash_enabled !== false,
    custom_icon_url: String(data.custom_icon_url ?? ''),
  }
}

export function PwaSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [preview, setPreview] = useState<{ name: string; icon: string }>({ name: '', icon: '' })

  const q = useQuery({
    queryKey: ['settings', 'pwa'],
    queryFn: () => apiFetch<PwaSettings>('settings/pwa'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (!q.data) return
    setDraft(toDraft(q.data))
    setPreview({
      name: String(q.data.resolved_name || ''),
      icon: String(q.data.icon_url || q.data.site_icon_url || ''),
    })
  }, [q.data])

  const save = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error('No draft')
      const { custom_icon_url: _url, ...body } = draft
      return apiFetch<PwaSettings>('settings/pwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    onSuccess: (data) => {
      qc.setQueryData(['settings', 'pwa'], data)
      setDraft(toDraft(data))
      setPreview({
        name: String(data.resolved_name || ''),
        icon: String(data.icon_url || data.site_icon_url || ''),
      })
      toast.success(t('common.saved'))
      toast.message(t('settings.pwa.reloadHint'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft && q.isLoading) return <FormSettingsSkeleton cards={3} fieldsPerCard={4} />
  if (q.isError && !draft) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!draft) return null

  const liveName =
    draft.name.trim() ||
    preview.name ||
    t('settings.pwa.namePlaceholder', { site: window.webinoDashboard?.siteName || '' })
  const liveIcon =
    draft.icon_source === 'custom' && draft.custom_icon_url
      ? draft.custom_icon_url
      : preview.icon || String(q.data?.site_icon_url || '')

  return (
    <div className="space-y-4 pb-20 sm:pb-0">
      <Card variant="hero" className="overflow-hidden">
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
            <Smartphone className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-base">{t('settings.pwa.title')}</CardTitle>
          <CardDescription>{t('settings.pwa.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="pwa-enabled">{t('settings.pwa.enabled')}</Label>
              <p className="text-muted-foreground text-xs">{t('settings.pwa.enabledHint')}</p>
            </div>
            <Switch
              id="pwa-enabled"
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
            />
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border p-3"
            style={{ backgroundColor: draft.background_color }}
          >
            {liveIcon ? (
              <img src={liveIcon} alt="" className="size-14 rounded-xl border bg-white object-contain p-1" />
            ) : (
              <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-xl text-xs">
                —
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: draft.theme_color }}>
                {liveName}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {draft.short_name.trim() || preview.name || t('settings.pwa.shortNameDefault')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">{t('settings.pwa.identityTitle')}</CardTitle>
          <CardDescription>{t('settings.pwa.identityHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pwa-name">{t('settings.pwa.fieldName')}</Label>
            <Input
              id="pwa-name"
              value={draft.name}
              placeholder={t('settings.pwa.nameAutoHint')}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              disabled={!draft.enabled}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwa-short">{t('settings.pwa.fieldShortName')}</Label>
            <Input
              id="pwa-short"
              value={draft.short_name}
              placeholder={t('settings.pwa.shortNameDefault')}
              onChange={(e) => setDraft({ ...draft, short_name: e.target.value })}
              disabled={!draft.enabled}
              className="w-full"
              maxLength={12}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwa-desc">{t('settings.pwa.fieldDescription')}</Label>
            <Textarea
              id="pwa-desc"
              value={draft.description}
              placeholder={t('settings.pwa.descriptionAutoHint')}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              disabled={!draft.enabled}
              className="min-h-20 w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.pwa.appearanceTitle')}</CardTitle>
          <CardDescription>
            <Link to="/settings/site/style" className="text-primary underline-offset-2 hover:underline">
              {t('settings.style.movedHint')}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('settings.pwa.fieldDisplay')}</Label>
              <Select
                value={draft.display}
                onValueChange={(v) => setDraft({ ...draft, display: v as Draft['display'] })}
                disabled={!draft.enabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standalone">{t('settings.pwa.displayStandalone')}</SelectItem>
                  <SelectItem value="fullscreen">{t('settings.pwa.displayFullscreen')}</SelectItem>
                  <SelectItem value="minimal-ui">{t('settings.pwa.displayMinimal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('settings.pwa.fieldOrientation')}</Label>
              <Select
                value={draft.orientation}
                onValueChange={(v) => setDraft({ ...draft, orientation: v as Draft['orientation'] })}
                disabled={!draft.enabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t('settings.pwa.orientationAny')}</SelectItem>
                  <SelectItem value="portrait">{t('settings.pwa.orientationPortrait')}</SelectItem>
                  <SelectItem value="landscape">{t('settings.pwa.orientationLandscape')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t('settings.pwa.fieldIcon')}</Label>
            <RadioGroup
              value={draft.icon_source}
              onValueChange={(v) =>
                setDraft({ ...draft, icon_source: v === 'custom' ? 'custom' : 'site' })
              }
              disabled={!draft.enabled}
              className="gap-3"
            >
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="site" id="pwa-icon-site" className="mt-0.5" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{t('settings.pwa.iconSite')}</p>
                  <p className="text-muted-foreground text-xs">{t('settings.pwa.iconSiteHint')}</p>
                  {q.data?.site_icon_url ? (
                    <img
                      src={q.data.site_icon_url}
                      alt=""
                      className="mt-1 size-10 rounded-md border object-contain"
                    />
                  ) : null}
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="custom" id="pwa-icon-custom" className="mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-medium">{t('settings.pwa.iconCustom')}</p>
                  <p className="text-muted-foreground text-xs">{t('settings.pwa.iconCustomHint')}</p>
                  {draft.icon_source === 'custom' ? (
                    <DocumentLogoField
                      label={t('settings.pwa.pickIcon')}
                      imageId={draft.icon_id}
                      imageUrl={draft.custom_icon_url}
                      onChange={(next) =>
                        setDraft({
                          ...draft,
                          icon_source: 'custom',
                          icon_id: next.id,
                          custom_icon_url: next.url,
                        })
                      }
                      onRemove={() =>
                        setDraft({
                          ...draft,
                          icon_id: 0,
                          custom_icon_url: '',
                          icon_source: 'site',
                        })
                      }
                    />
                  ) : null}
                </div>
              </label>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.pwa.behaviorTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="pwa-banner">{t('settings.pwa.showInstallBanner')}</Label>
              <p className="text-muted-foreground text-xs">{t('settings.pwa.showInstallBannerHint')}</p>
            </div>
            <Switch
              id="pwa-banner"
              checked={draft.show_install_banner}
              disabled={!draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, show_install_banner: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="pwa-splash">{t('settings.pwa.splashEnabled')}</Label>
              <p className="text-muted-foreground text-xs">{t('settings.pwa.splashEnabledHint')}</p>
            </div>
            <Switch
              id="pwa-splash"
              checked={draft.splash_enabled}
              disabled={!draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, splash_enabled: v })}
            />
          </div>
          <div className="hidden sm:block">
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-20 border-t p-3 backdrop-blur sm:hidden">
        <Button type="button" className="w-full" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
