import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BuildPipelinePanel } from '@/components/settings/BuildPipelinePanel'
import { CoreUpdatePanel } from '@/components/settings/CoreUpdatePanel'
import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setDashboardLanguage } from '@/i18n'
import { apiFetch } from '@/lib/api'
import { normalizeAccent } from '@/lib/accent'
import { toastApiError } from '@/lib/apiError'
import { useTheme } from '@/theme/ThemeProvider'

type DashboardSettings = {
  ui_locale: string
  ui_theme: string
  ui_accent: string
  ui_fullscreen_default: boolean
}

export function DashboardSettingsPanel() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { theme, setTheme } = useTheme()
  const themeValue = theme ?? 'system'
  const [accent, setAccent] = useState('default')
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

  return (
    <div className="space-y-6">
      <CoreUpdatePanel />
      <BuildPipelinePanel />
      {q.isLoading ? <FormSettingsSkeleton /> : null}
      {q.isError ? <QueryErrorState onRetry={() => void q.refetch()} /> : null}
      {!q.isLoading && !q.isError ? (
    <Card className="max-w-lg shadow-sm">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label>{t('settings.language')}</Label>
          <Select value={i18n.language} onValueChange={(v) => void save.mutateAsync({ ui_locale: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('settings.langEn')}</SelectItem>
              <SelectItem value="fa">{t('settings.langFa')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('settings.theme')}</Label>
          <Select value={themeValue} onValueChange={(v) => void save.mutateAsync({ ui_theme: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
              <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
              <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('settings.accent')}</Label>
          <Select value={accent} onValueChange={(v) => { setAccent(v); void save.mutateAsync({ ui_accent: v }) }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t('settings.accentDefault')}</SelectItem>
              <SelectItem value="red">{t('settings.accentRed')}</SelectItem>
              <SelectItem value="rose">{t('settings.accentRose')}</SelectItem>
              <SelectItem value="orange">{t('settings.accentOrange')}</SelectItem>
              <SelectItem value="green">{t('settings.accentGreen')}</SelectItem>
              <SelectItem value="blue">{t('settings.accentBlue')}</SelectItem>
              <SelectItem value="yellow">{t('settings.accentYellow')}</SelectItem>
              <SelectItem value="violet">{t('settings.accentViolet')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="settings-fs-default" checked={fullscreenDef} onCheckedChange={(v) => void save.mutateAsync({ ui_fullscreen_default: v === true })} />
          <Label htmlFor="settings-fs-default" className="cursor-pointer font-normal">{t('settings.fullscreenDefault')}</Label>
        </div>
      </CardContent>
    </Card>
      ) : null}
    </div>
  )
}
