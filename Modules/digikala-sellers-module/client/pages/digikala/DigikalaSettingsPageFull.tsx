import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

export default function DigikalaSettingsPageFull() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const settingsQ = useQuery({
    queryKey: ['digikala', 'settings'],
    queryFn: () => apiFetch<{ settings: Record<string, unknown> }>('digikala/settings'),
  })
  const s = settingsQ.data?.settings ?? {}

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('digikala/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      toast.success(t('digikala.settingsSaved'))
      await qc.invalidateQueries({ queryKey: ['digikala', 'settings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <PageShell title={t('digikala.settingsTitle')} description={t('digikala.settingsSubtitle')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('digikala.settingsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid max-w-xl gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="dk-base">
              {t('digikala.baseUrl')}
            </label>
            <Input
              key={`base-${String(s.base_url ?? '')}`}
              defaultValue={String(s.base_url ?? '')}
              placeholder="https://seller.digikala.com"
              id="dk-base"
              onBlur={(e) => save.mutate({ base_url: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="dk-client">
              {t('digikala.clientCodeOptional')}
            </label>
            <CardDescription className="text-xs">{t('digikala.clientCodeHint')}</CardDescription>
            <Input
              key={`client-${String(s.client_code ?? '')}`}
              defaultValue={String(s.client_code ?? '')}
              placeholder={t('digikala.clientCodePlaceholder')}
              id="dk-client"
              onBlur={(e) => save.mutate({ client_code: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="dk-credit">
              {t('digikala.creditIncrease')}
            </label>
            <Input
              key={`credit-${String(s.credit_increase_percentage ?? 0)}`}
              type="number"
              defaultValue={String(s.credit_increase_percentage ?? 0)}
              id="dk-credit"
              onBlur={(e) => save.mutate({ credit_increase_percentage: Number(e.target.value) || 0 })}
            />
          </div>
          {typeof s.webhook_url === 'string' && s.webhook_url ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('digikala.webhookUrl')}</label>
              <code className="bg-muted block overflow-x-auto rounded-md p-2 text-xs">{s.webhook_url}</code>
            </div>
          ) : null}
          <Button
            variant={s.auto_sync ? 'default' : 'outline'}
            onClick={() => save.mutate({ auto_sync: !s.auto_sync })}
          >
            {t('digikala.autoSync')}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
