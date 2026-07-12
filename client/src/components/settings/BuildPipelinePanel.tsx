import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Hammer, Square, RefreshCw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import {
  cancelBuildPipeline,
  fetchBuildPipelineStatus,
  startBuildPipeline,
} from '@/lib/build-pipeline-api'
import { toastApiError } from '@/lib/apiError'

export function BuildPipelinePanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const bootstrap = useBootstrapQuery()
  const licenseActive = bootstrap.data?.license?.active ?? false

  const statusQ = useQuery({
    queryKey: ['build-pipeline', 'status'],
    queryFn: fetchBuildPipelineStatus,
    refetchInterval: (q) => (q.state.data?.status === 'running' ? 2000 : false),
    enabled: licenseActive,
  })

  const start = useMutation({
    mutationFn: startBuildPipeline,
    onSuccess: () => {
      toast.success(t('buildPipeline.started'))
      void qc.invalidateQueries({ queryKey: ['build-pipeline', 'status'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const cancel = useMutation({
    mutationFn: cancelBuildPipeline,
    onSuccess: () => {
      toast.message(t('buildPipeline.cancelled'))
      void qc.invalidateQueries({ queryKey: ['build-pipeline', 'status'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const s = statusQ.data
  const running = s?.status === 'running'
  const devAllowed = s?.dev_allowed !== false
  const busy = start.isPending || cancel.isPending || statusQ.isFetching

  const prevStatus = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (s?.status === 'success' && prevStatus.current === 'running') {
      toast.success(t('buildPipeline.success'))
    }
    prevStatus.current = s?.status
  }, [s?.status, t])

  const statusBadge = () => {
    if (!s) return null
    if (s.status === 'running') return <Badge>{t('buildPipeline.statusRunning')}</Badge>
    if (s.status === 'success') return <Badge variant="secondary">{t('buildPipeline.statusSuccess')}</Badge>
    if (s.status === 'failed') return <Badge variant="destructive">{t('buildPipeline.statusFailed')}</Badge>
    return <Badge variant="outline">{t('buildPipeline.statusIdle')}</Badge>
  }

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t('buildPipeline.title')}</CardTitle>
        <CardDescription>{t('buildPipeline.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!licenseActive ? (
          <p className="text-muted-foreground text-sm">{t('buildPipeline.licenseRequired')}</p>
        ) : !devAllowed ? (
          <p className="text-muted-foreground text-sm">{t('buildPipeline.devOnly')}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">{statusBadge()}</div>
            {s?.steps?.length ? (
              <ul className="space-y-1 text-sm">
                {s.steps.map((step) => (
                  <li key={step.id} className="flex items-center gap-2">
                    <span className={step.done ? 'text-emerald-600' : running && s.current_step === step.id ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {step.done ? '✓' : running && s.current_step === step.id ? '…' : '○'}
                    </span>
                    <span>{step.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {s?.error ? <p className="text-destructive text-sm">{s.error}</p> : null}
            {s?.log_tail ? (
              <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">{s.log_tail}</pre>
            ) : null}
          </>
        )}
      </CardContent>
      {licenseActive && devAllowed ? (
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy || running}
            onClick={() => {
              if (!window.confirm(t('buildPipeline.confirm'))) return
              start.mutate()
            }}
          >
            <Hammer className="me-2 size-4" aria-hidden />
            {t('buildPipeline.run')}
          </Button>
          {running ? (
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => cancel.mutate()}>
              <Square className="me-2 size-4" aria-hidden />
              {t('buildPipeline.cancel')}
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void qc.invalidateQueries({ queryKey: ['build-pipeline', 'status'] })}>
              <RefreshCw className="me-2 size-4" aria-hidden />
              {t('buildPipeline.refresh')}
            </Button>
          )}
        </CardFooter>
      ) : null}
    </Card>
  )
}
