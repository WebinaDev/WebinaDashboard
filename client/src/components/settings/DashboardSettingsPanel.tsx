import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Moon, Palette, Sun, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BuildPipelinePanel } from '@/components/settings/BuildPipelinePanel'
import { CoreUpdatePanel } from '@/components/settings/CoreUpdatePanel'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setDashboardLanguage } from '@/i18n'
import { apiFetch } from '@/lib/api'
import { ACCENT_MENU_ITEMS, ACCENT_SWATCH, normalizeAccent, type AccentPreset } from '@/lib/accent'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'
import { useTheme } from '@/theme/ThemeProvider'

type DashboardSettings = {
  ui_locale: string
  ui_theme: string
  ui_accent: string
  ui_fullscreen_default: boolean
}

const ACCENTS = ACCENT_MENU_ITEMS.map((i) => i.value)

export function DashboardSettingsPanel() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { theme, setTheme } = useTheme()
  const [accent, setAccent] = useState<AccentPreset>('colorful')
  const themeValue = theme ?? 'light'
  const [fullscreenDef, setFullscreenDef] = useState(false)

  const q = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiFetch<DashboardSettings>('settings'),
  })

  useEffect(() => {
    if (q.data?.ui_accent) setAccent(normalizeAccent(q.data.ui_accent))
    if (q.data) setFullscreenDef(Boolean(q.data.ui_fullscreen_default))
  }, [q.data])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', normalizeAccent(accent))
  }, [accent])

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<DashboardSettings>('settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: (s) => {
      void qc.invalidateQueries({ queryKey: ['settings'] })
      void qc.invalidateQueries({ queryKey: ['bootstrap'] })
      if (s.ui_locale) void setDashboardLanguage(s.ui_locale)
      if (s.ui_theme) setTheme(s.ui_theme as 'light' | 'dark' | 'system')
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const themeOptions = [
    { value: 'system', label: t('settings.themeSystem'), icon: Monitor },
    { value: 'light', label: t('settings.themeLight'), icon: Sun },
    { value: 'dark', label: t('settings.themeDark'), icon: Moon },
  ] as const

  return (
    <div className="space-y-6">
      <CoreUpdatePanel />
      <BuildPipelinePanel />
      {q.isLoading ? <FormSettingsSkeleton /> : null}
      {q.isError ? <QueryErrorState onRetry={() => void q.refetch()} /> : null}
      {!q.isLoading && !q.isError ? (
        <Card variant="hero" className="overflow-hidden">
          <CardHeader>
            <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-2xl">
              <Palette className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-base">{t('settings.appearanceTitle')}</CardTitle>
            <CardDescription>{t('settings.appearanceHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('settings.language')}</Label>
              <Select value={i18n.language} onValueChange={(v) => void save.mutateAsync({ ui_locale: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settings.langEn')}</SelectItem>
                  <SelectItem value="fa">{t('settings.langFa')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.theme')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs transition-colors',
                      themeValue === opt.value
                        ? 'border-primary/40 bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50',
                    )}
                    onClick={() => void save.mutateAsync({ ui_theme: opt.value })}
                  >
                    <opt.icon className="size-4" aria-hidden />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.accent')}</Label>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => {
                  const item = ACCENT_MENU_ITEMS.find((i) => i.value === a)!
                  const labelKey = item.labelKey
                  const swatch = ACCENT_SWATCH[a]
                  return (
                    <button
                      key={a}
                      type="button"
                      aria-label={t(labelKey)}
                      className={cn(
                        'size-8 rounded-full border-2 transition-transform',
                        accent === a ? 'border-foreground scale-110' : 'border-transparent',
                      )}
                      style={{ background: swatch }}
                      onClick={() => {
                        setAccent(a)
                        void save.mutateAsync({ ui_accent: a })
                      }}
                    />
                  )
                })}
              </div>
            </div>

            <div className="bg-background/50 flex items-center gap-2 rounded-xl border px-3 py-3">
              <Checkbox
                id="settings-fs-default"
                checked={fullscreenDef}
                onCheckedChange={(v) => void save.mutateAsync({ ui_fullscreen_default: v === true })}
              />
              <Label htmlFor="settings-fs-default" className="cursor-pointer font-normal">
                {t('settings.fullscreenDefault')}
              </Label>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
