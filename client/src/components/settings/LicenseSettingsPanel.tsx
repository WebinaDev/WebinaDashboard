import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { translateLicenseStatus } from '@/lib/enumLabels'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { formatDisplayDate } from '@/lib/date'

type LicenseSnap = {
  active?: boolean
  demo?: boolean
  status?: string
  message?: string
  expiry?: string | null
  domain?: string
}

export function LicenseSettingsPanel() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const bq = useBootstrapQuery()

  const lic = useMemo(
    (): LicenseSnap | undefined => bq.data?.license ?? window.webinoDashboard.license,
    [bq.data?.license],
  )

  const check = useMutation({
    mutationFn: () =>
      apiFetch('license/remote-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bootstrap'] })
      toast.success(t('license.checkOk'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const domain = lic?.domain ?? window.webinoDashboard.license?.domain ?? ''
  const isOk = Boolean(lic?.active || lic?.demo)

  return (
    <div className="space-y-4">
      <Card variant="hero">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
              <ShieldCheck className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-base">{t('license.cardTitle')}</CardTitle>
            <CardDescription>{t('license.description')}</CardDescription>
          </div>
          {isOk ? (
            <Badge className="shrink-0">{lic?.demo ? t('license.badgeDemo') : t('license.badgeActive')}</Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              {translateLicenseStatus(t, lic?.status ?? 'pending')}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="bg-background/60 rounded-xl border p-4">
              <dt className="text-muted-foreground text-xs font-medium">{t('license.fieldDomain')}</dt>
              <dd className="mt-1 font-mono text-sm break-all">{domain || '—'}</dd>
            </div>
            <div className="bg-background/60 rounded-xl border p-4">
              <dt className="text-muted-foreground text-xs font-medium">{t('license.fieldExpiry')}</dt>
              <dd className="mt-1 text-sm">{lic?.expiry ? formatDisplayDate(lic.expiry, i18n.language) : '—'}</dd>
            </div>
          </dl>
          {lic?.message ? <p className="text-muted-foreground text-xs break-words">{lic.message}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t">
          <Button type="button" variant="secondary" size="sm" disabled={check.isPending} onClick={() => void check.mutateAsync()}>
            <RefreshCw className="me-1 size-4" />
            {t('license.refreshStatus')}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/license">{t('settings.site.licenseFullPage')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
