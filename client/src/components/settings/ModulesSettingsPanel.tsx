import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { moduleNavTitle } from '@/lib/nav-modules'
import { invalidateModuleBundleCache } from '@/lib/moduleRuntime'
import { toastApiError } from '@/lib/apiError'

type ModuleRow = { id: string; title: string; active: boolean }

export function ModulesSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiFetch<{ dashboard_modules?: ModuleRow[] }>('settings'),
  })

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['settings'] })
      void qc.invalidateQueries({ queryKey: ['bootstrap'] })
      const toggled = variables.modules as Record<string, boolean> | undefined
      if (toggled) {
        for (const [slug, active] of Object.entries(toggled)) {
          if (!active) {
            invalidateModuleBundleCache(slug)
          }
        }
      }
      invalidateModuleBundleCache()
      toast.success(t('common.saved'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const modules = q.data?.dashboard_modules?.filter((m) => m.id !== 'home') ?? []
  if (!modules.length) return null

  return (
    <Card className="max-w-lg shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <Label className="text-base">{t('settings.modulesTitle')}</Label>
        <p className="text-muted-foreground text-xs">{t('settings.modulesHint')}</p>
        <ul className="space-y-2">
          {modules.map((mod) => (
            <li key={mod.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{moduleNavTitle(t, mod.id, mod.title)}</span>
              <Checkbox
                checked={mod.active}
                onCheckedChange={(checked) => {
                  const rows = q.data?.dashboard_modules
                  if (!rows?.length) return
                  const map: Record<string, boolean> = {}
                  for (const m of rows) map[m.id] = m.id === mod.id ? checked === true : m.active
                  void save.mutateAsync({ modules: map })
                }}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
