import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { KeyValueList, StatusBadge } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export default function BasalamSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const settingsQ = useQuery({
    queryKey: ['basalam', 'settings'],
    queryFn: () => apiFetch<{ settings: Record<string, unknown> }>('basalam/settings'),
  })
  const statusQ = useQuery({
    queryKey: ['basalam', 'status'],
    queryFn: () => apiFetch<Record<string, unknown>>('basalam/status'),
  })

  const reconcile = useMutation({
    mutationFn: () => apiFetch('basalam/reconcile', { method: 'POST' }),
    onSuccess: async () => {
      toast.success(t('basalam.reconcileQueued'))
      await qc.invalidateQueries({ queryKey: ['basalam', 'status'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = settingsQ.data?.settings ?? {}
  const st = statusQ.data ?? {}

  return (
    <PageShell title={t('basalam.title')} description={t('basalam.subtitle')}>
      <section className="mb-4 space-y-4 rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => reconcile.mutate()}>{t('basalam.reconcileNow')}</Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/settings/shop/pricing/marketplaces">{t('wnc.openPricingTab')}</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">{t('basalam.settingsTitle', 'Settings')}</h3>
            <KeyValueList
              emptyLabel={t('common.empty')}
              rows={Object.entries(s)
                .filter(([k]) => !['private_key', 'client_secret', 'access_token', 'refresh_token'].includes(k))
                .slice(0, 12)
                .map(([k, v]) => ({
                  label: k,
                  value:
                    typeof v === 'boolean' ? (
                      <StatusBadge status={v ? 'on' : 'off'} tone={v ? 'success' : 'secondary'} />
                    ) : (
                      String(v ?? '—')
                    ),
                }))}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">{t('basalam.statusTitle', 'Status')}</h3>
            <KeyValueList
              emptyLabel={t('common.empty')}
              rows={Object.entries(st)
                .slice(0, 12)
                .map(([k, v]) => ({
                  label: k,
                  value:
                    typeof v === 'boolean' ? (
                      <StatusBadge status={v ? 'ok' : 'no'} tone={v ? 'success' : 'destructive'} />
                    ) : (
                      String(v ?? '—')
                    ),
                }))}
            />
          </div>
        </div>
      </section>
      <WncPlatformPanel platform="basalam" titleKey="wnc.modules.basalam.title" subtitleKey="wnc.modules.basalam.subtitle" embedded />
    </PageShell>
  )
}
