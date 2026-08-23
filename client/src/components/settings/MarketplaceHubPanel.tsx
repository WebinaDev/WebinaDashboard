import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type HubItem = {
  id: string
  title_key: string
  module_slug: string
  module_active: boolean
  platform: string
  enabled: boolean
  available: boolean
  settings_path: string
}

export function MarketplaceHubPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const hubQ = useQuery({
    queryKey: ['wnc-hub'],
    queryFn: () => apiFetch<{ items: HubItem[] }>('wnc/hub'),
  })
  useQueryErrorToast(hubQ)

  const toggle = useMutation({
    mutationFn: async (item: HubItem) => {
      if (!item.available || !item.platform) throw new Error(t('bazaarHub.unavailable'))
      return apiFetch('wnc/' + item.platform + '/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !item.enabled }),
      })
    },
    onSuccess: async (_data, item) => {
      toast.success(t('common.saved'))
      await qc.invalidateQueries({ queryKey: ['wnc-hub'] })
      await qc.invalidateQueries({ queryKey: ['wnc', item.platform, 'settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const items = hubQ.data?.items ?? []

  return (
    <div className="grid gap-2">
      {hubQ.isLoading ? (
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      ) : (
        items.map((item) => {
          const warning = !item.module_active ? t('bazaarHub.warnModule') : ''
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3"
            >
              <Switch
                checked={item.enabled}
                disabled={!item.available || toggle.isPending}
                onCheckedChange={() => void toggle.mutateAsync(item)}
                aria-label={t(item.title_key)}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t(item.title_key)}</p>
                {warning ? <p className="text-muted-foreground text-xs">{warning}</p> : null}
              </div>
              <Button type="button" variant="ghost" size="icon" asChild>
                <Link to={item.settings_path} aria-label={t('bazaarHub.openSettings')}>
                  <Settings className="size-4" />
                </Link>
              </Button>
            </div>
          )
        })
      )}
    </div>
  )
}
