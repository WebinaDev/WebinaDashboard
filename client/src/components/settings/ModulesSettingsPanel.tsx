import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Puzzle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { apiFetch } from '@/lib/api'
import { moduleNavTitle } from '@/lib/nav-modules'
import { invalidateModuleBundleCache } from '@/lib/moduleRuntime'
import { toastApiError } from '@/lib/apiError'
import { cn } from '@/lib/utils'

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
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t('settings.modulesTitle')}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.modulesHint')}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {modules.map((mod) => (
          <li key={mod.id}>
            <Card
              variant="glass"
              className={cn('py-4 transition-colors', mod.active ? 'border-primary/25' : 'opacity-90')}
            >
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-4">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Puzzle className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-sm">{moduleNavTitle(t, mod.id, mod.title)}</CardTitle>
                  <CardDescription className="text-xs">
                    {mod.active ? t('settings.moduleOn') : t('settings.moduleOff')}
                  </CardDescription>
                </div>
                <Switch
                  checked={mod.active}
                  disabled={save.isPending}
                  onCheckedChange={(checked) => {
                    const rows = q.data?.dashboard_modules
                    if (!rows?.length) return
                    const map: Record<string, boolean> = {}
                    for (const m of rows) map[m.id] = m.id === mod.id ? checked === true : m.active
                    void save.mutateAsync({ modules: map })
                  }}
                />
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
