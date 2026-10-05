import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { KeyValueList, StatusBadge } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export default function DigikalaSettingsPage() {
  const { t } = useTranslation()

  const settingsQ = useQuery({
    queryKey: ['digikala', 'settings'],
    queryFn: () => apiFetch<{ settings: Record<string, unknown> }>('digikala/settings'),
  })
  const healthQ = useQuery({
    queryKey: ['digikala', 'health'],
    queryFn: () => apiFetch<Record<string, unknown>>('digikala/health'),
  })

  const test = useMutation({
    mutationFn: () => apiFetch('digikala/test-connection', { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('wnc.testOk')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = settingsQ.data?.settings ?? {}
  const h = healthQ.data ?? {}

  return (
    <PageShell title={t('digikala.title')} description={t('digikala.subtitle', 'Digikala sellers')}>
      <section className="mb-4 space-y-3 rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void test.mutateAsync()} disabled={test.isPending}>
            {t('wnc.testConnection')}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/settings/shop/pricing/marketplaces">{t('wnc.openPricingTab')}</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">{t('digikala.settingsTitle')}</h3>
            <KeyValueList
              emptyLabel={t('common.empty')}
              rows={[
                { label: t('digikala.clientCode'), value: String(s.client_code ?? '—') },
                { label: t('digikala.baseUrl'), value: String(s.base_url ?? '—') },
                {
                  label: t('digikala.autoSync'),
                  value: <StatusBadge status={s.auto_sync ? 'on' : 'off'} tone={s.auto_sync ? 'success' : 'secondary'} />,
                },
                { label: t('digikala.webhookUrl'), value: String(s.webhook_url ?? '—') },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">{t('digikala.healthTitle')}</h3>
            <KeyValueList
              emptyLabel={t('common.empty')}
              rows={[
                {
                  label: t('digikala.endpointStatus'),
                  value: (
                    <StatusBadge
                      status={h.status ?? '—'}
                      tone={
                        h.status === 'healthy'
                          ? 'success'
                          : h.status === 'critical'
                            ? 'destructive'
                            : 'warning'
                      }
                    />
                  ),
                },
                {
                  label: 'Auth',
                  value: (
                    <StatusBadge
                      status={h.auth_ok ? 'ok' : 'fail'}
                      tone={h.auth_ok ? 'success' : 'destructive'}
                    />
                  ),
                },
                { label: t('wnc.jobs', 'Queue pending'), value: String(h.queue_pending ?? '—') },
                { label: 'Running', value: String(h.queue_running ?? '—') },
                { label: 'Errors 24h', value: String(h.errors_24h ?? '—') },
              ]}
            />
          </div>
        </div>
      </section>
      <WncPlatformPanel platform="digikala" titleKey="wnc.modules.digikala.title" subtitleKey="wnc.modules.digikala.subtitle" embedded />
    </PageShell>
  )
}
