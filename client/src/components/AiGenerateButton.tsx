import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { apiFetch } from '@/lib/api'
import { ApiError, toastApiError } from '@/lib/apiError'
import { jobPhase, jobPhasePercent, sleep } from '@/lib/aiJobProgress'

type AiJobRow = {
  id: number
  status: string
  result_summary?: string
  error_message?: string
}

type GenerateRes = {
  ok: boolean
  job_id: number
  queued?: boolean
  job?: AiJobRow
}

type AiGenerateButtonProps = {
  type: 'product' | 'post' | 'product_cat' | 'product_brand' | 'blog' | 'category'
  id?: number
  payload?: Record<string, unknown>
  sync?: boolean
  onDone?: () => void
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
}

const POLL_MS = 2_000
const POLL_DEADLINE_MS = 8 * 60 * 1000

function isTerminal(status: string) {
  return status === 'done' || status === 'failed' || status === 'cancelled'
}

export function AiGenerateButton({
  type,
  id = 0,
  payload,
  onDone,
  size = 'sm',
  variant = 'outline',
  className,
}: AiGenerateButtonProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const boot = useBootstrapQuery()
  const active = (boot.data?.activeModuleClients ?? []).some((c) => c.slug === 'ai-content-module')
  const [job, setJob] = useState<AiJobRow | null>(null)
  const [busy, setBusy] = useState(false)

  const finishSuccess = (_res: AiJobRow) => {
    toast.success(t('aiContent.generateDone'))
    void qc.invalidateQueries({ queryKey: ['ai-content'] })
    if (type === 'product' && id) {
      void qc.invalidateQueries({ queryKey: ['coffee-profile', id] })
      void qc.invalidateQueries({ queryKey: ['product', id] })
      void qc.invalidateQueries({ queryKey: ['shop', 'products', id] })
    }
    onDone?.()
    window.setTimeout(() => setJob(null), 800)
  }

  const mut = useMutation({
    mutationFn: async () => {
      setBusy(true)
      const queued = await apiFetch<GenerateRes>('ai-content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, sync: false, payload }),
      })
      if (!queued?.job_id || queued.job_id < 1) {
        throw new ApiError(t('aiContent.jobQueueFailed'), { code: 'ai_enqueue', status: 500 })
      }
      const jobId = queued.job_id
      setJob({ id: jobId, status: 'pending', result_summary: 'queued' })

      void apiFetch<{ ok: boolean; job?: AiJobRow }>(
        `ai-content/jobs/${jobId}/run`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
        30_000,
      )
        .then((res) => {
          if (res?.job) setJob(res.job)
        })
        .catch(() => {
          /* HTTP timeout/HTML is not a generation failure while the job exists */
        })

      const deadline = Date.now() + POLL_DEADLINE_MS
      let latest: AiJobRow = queued.job ?? { id: jobId, status: 'pending', result_summary: 'queued' }
      while (Date.now() < deadline) {
        await sleep(POLL_MS)
        try {
          latest = await apiFetch<AiJobRow>(`ai-content/jobs/${jobId}`)
          setJob(latest)
          if (isTerminal(latest.status)) {
            return latest
          }
        } catch {
          /* keep polling through transient / invalid JSON */
        }
      }
      try {
        latest = await apiFetch<AiJobRow>(`ai-content/jobs/${jobId}`)
        setJob(latest)
      } catch {
        /* keep last known row */
      }
      return latest
    },
    onSuccess: (res) => {
      setBusy(false)
      if (res.status === 'failed') {
        toast.error(res.error_message || t('aiContent.generateFailed'))
        return
      }
      if (res.status === 'cancelled') {
        toast.message(t('aiContent.jobCancelled'))
        return
      }
      if (res.status !== 'done') {
        toast.message(t('aiContent.generateStillRunning'))
        return
      }
      finishSuccess(res)
    },
    onError: (e: Error) => {
      setBusy(false)
      if (job) {
        toast.error(job.error_message || t('aiContent.generateFailed'))
        return
      }
      if (e instanceof ApiError && e.code === 'invalid_json') {
        toast.error(t('aiContent.generateFailed'))
        return
      }
      toastApiError(t, e)
      setJob(null)
    },
  })

  const cancel = useMutation({
    mutationFn: async () => {
      if (!job?.id) return null
      return apiFetch<{ ok: boolean; job: AiJobRow }>(`ai-content/jobs/${job.id}/cancel`, { method: 'POST' })
    },
    onSuccess: (res) => {
      if (res?.job) setJob(res.job)
      toast.message(t('aiContent.jobCancelRequested'))
      void qc.invalidateQueries({ queryKey: ['ai-content'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!active) return null

  const phase = jobPhase(job)
  const pct = jobPhasePercent(phase)
  const showOverlay = Boolean(job) && (busy || job?.status === 'done' || job?.status === 'failed' || job?.status === 'cancelled')
  const terminal = job ? isTerminal(job.status) : false

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        disabled={busy || (type !== 'blog' && !id)}
        onClick={() => void mut.mutateAsync()}
      >
        <Sparkles className="me-1 size-4" />
        {busy ? t('aiContent.generating') : t('aiContent.generate')}
      </Button>
      {showOverlay ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md space-y-4 rounded-xl border p-6 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4" />
              {t('aiContent.generateProgress')}
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div className="bg-primary h-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-muted-foreground text-sm">
              {t(`aiContent.phase.${phase}`, { defaultValue: phase })}
            </p>
            {job?.error_message && (job.status === 'failed' || job.status === 'cancelled') ? (
              <p className="text-destructive text-sm whitespace-pre-wrap">{job.error_message}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              {!terminal ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={cancel.isPending}
                  onClick={() => void cancel.mutateAsync()}
                >
                  {t('aiContent.jobsCancel')}
                </Button>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={() => setJob(null)}>
                  {t('aiContent.dismiss')}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
