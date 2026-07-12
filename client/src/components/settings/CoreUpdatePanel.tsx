import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { fetchCoreUpdateStatus, runCoreUpdate } from '@/lib/core-update-api'
import { toastApiError } from '@/lib/apiError'

export function CoreUpdatePanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const bootstrap = useBootstrapQuery()
  const licenseActive = bootstrap.data?.license?.active ?? false

  const statusQ = useQuery({
    queryKey: ['core', 'update-status'],
    queryFn: () => fetchCoreUpdateStatus(false),
    initialData: bootstrap.data?.coreUpdate,
    staleTime: 60_000,
    enabled: licenseActive,
  })

  const refresh = useMutation({
    mutationFn: () => fetchCoreUpdateStatus(true),
    onSuccess: (data) => {
      qc.setQueryData(['core', 'update-status'], data)
      toast.success(t('coreUpdate.refreshed'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const update = useMutation({
    mutationFn: () => runCoreUpdate(statusQ.data?.latest_version),
    onSuccess: (r) => {
      toast.success(t('coreUpdate.success', { version: r.version }))
      if (r.reload_required) {
        window.setTimeout(() => window.location.reload(), 800)
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = statusQ.data
  const busy = refresh.isPending || update.isPending || statusQ.isFetching

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t('coreUpdate.title')}</CardTitle>
        <CardDescription>{t('coreUpdate.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!licenseActive ? (
          <p className="text-muted-foreground text-sm">{t('coreUpdate.licenseRequired')}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('coreUpdate.current')}:</span>
              <Badge variant="secondary">{s?.version ?? '—'}</Badge>
              <span className="text-muted-foreground">{t('coreUpdate.latest')}:</span>
              <Badge variant="outline">{s?.latest_version ?? '—'}</Badge>
              {s?.update_available ? (
                <Badge>{t('coreUpdate.available')}</Badge>
              ) : (
                <Badge variant="secondary">{t('coreUpdate.upToDate')}</Badge>
              )}
            </div>
            {s?.unavailable ? (
              <p className="text-muted-foreground text-sm">{t('coreUpdate.crmUnavailable')}</p>
            ) : null}
            {s?.update_available && !s?.package_available ? (
              <p className="text-amber-600 text-sm dark:text-amber-400">{t('coreUpdate.packageMissing')}</p>
            ) : null}
            {s?.release_notes ? (
              <pre className="bg-muted max-h-40 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                {s.release_notes}
              </pre>
            ) : null}
          </>
        )}
      </CardContent>
      {licenseActive ? (
        <CardFooter className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => refresh.mutate()}>
            <RefreshCw className="me-2 size-4" aria-hidden />
            {t('coreUpdate.checkAgain')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy || !s?.update_available || !s?.package_available}
            onClick={() => {
              if (!window.confirm(t('coreUpdate.confirm'))) return
              update.mutate()
            }}
          >
            <Download className="me-2 size-4" aria-hidden />
            {t('coreUpdate.install')}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
