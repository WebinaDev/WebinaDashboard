import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusBadgeTone = 'default' | 'success' | 'warning' | 'destructive' | 'secondary'

const TONE_CLASS: Record<StatusBadgeTone, string> = {
  default: '',
  success: 'border-transparent bg-emerald-600 text-white dark:bg-emerald-500',
  warning: 'border-transparent bg-amber-500 text-white',
  destructive: '',
  secondary: '',
}

export function statusToneFromJob(status: unknown): StatusBadgeTone {
  const s = String(status ?? '').toLowerCase()
  if (s === 'done' || s === 'completed' || s === 'success' || s === 'ok') return 'success'
  if (s === 'failed' || s === 'error' || s === 'cancelled' || s === 'canceled') return 'destructive'
  if (s === 'running' || s === 'processing') return 'warning'
  if (s === 'pending' || s === 'queued') return 'secondary'
  return 'default'
}

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: unknown
  tone?: StatusBadgeTone
  className?: string
}) {
  const resolved = tone ?? statusToneFromJob(status)
  const label = status == null || status === '' ? '—' : String(status)
  return (
    <Badge
      variant={resolved === 'destructive' ? 'destructive' : resolved === 'secondary' ? 'secondary' : 'outline'}
      className={cn(TONE_CLASS[resolved], className)}
    >
      {label}
    </Badge>
  )
}

export function KeyValueList({
  rows,
  emptyLabel = '—',
  className,
}: {
  rows: Array<{ label: ReactNode; value: ReactNode }>
  emptyLabel?: string
  className?: string
}) {
  if (!rows.length) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>
  }
  return (
    <dl className={cn('divide-border divide-y text-sm', className)}>
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-start justify-between gap-2 py-2">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="max-w-full break-words text-end font-medium">{row.value ?? emptyLabel}</dd>
        </div>
      ))}
    </dl>
  )
}

export type JobLike = {
  id?: number | string
  type?: string
  job_type?: string
  status?: string
  error_message?: string
  error?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export function JobsTable({
  jobs,
  emptyLabel,
  typeLabel = 'Type',
  statusLabel = 'Status',
  errorLabel = 'Error',
}: {
  jobs: JobLike[]
  emptyLabel: string
  typeLabel?: string
  statusLabel?: string
  errorLabel?: string
}) {
  if (!jobs.length) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-start">
            <th className="py-2 pe-2">ID</th>
            <th className="py-2 pe-2">{typeLabel}</th>
            <th className="py-2 pe-2">{statusLabel}</th>
            <th className="py-2">{errorLabel}</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={String(j.id ?? `${j.type}-${j.created_at}`)} className="border-b align-top">
              <td className="py-2 pe-2 font-mono text-xs">{j.id ?? '—'}</td>
              <td className="py-2 pe-2 font-mono text-xs">{String(j.type ?? j.job_type ?? '—')}</td>
              <td className="py-2 pe-2">
                <StatusBadge status={j.status} />
              </td>
              <td className="text-muted-foreground py-2 text-xs">
                {String(j.error_message ?? j.error ?? '—')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PhaseCoverageCards({
  data,
  emptyLabel,
}: {
  data: Record<string, unknown> | null | undefined
  emptyLabel: string
}) {
  const entries = Object.entries(data ?? {})
  if (!entries.length) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([phase, items]) => {
        const list = Array.isArray(items) ? items.map(String) : [String(items)]
        return (
          <div key={phase} className="bg-muted/40 rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium capitalize">{phase}</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              {list.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary mt-1 size-1.5 shrink-0 rounded-full bg-current" />
                  <span>{item.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export function LogRows({
  items,
  emptyLabel,
}: {
  items: Array<Record<string, unknown>>
  emptyLabel: string
}) {
  if (!items.length) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>
  }
  return (
    <ul className="max-h-96 space-y-2 overflow-auto">
      {items.map((row, i) => {
        const level = String(row.level ?? row.severity ?? 'info')
        const message = String(row.message ?? row.msg ?? row.event ?? JSON.stringify(row))
        const when = String(row.created_at ?? row.time ?? row.timestamp ?? '')
        const context = String(row.context ?? row.channel ?? row.source ?? '')
        return (
          <li key={String(row.id ?? i)} className="bg-muted/30 rounded-md border p-2 text-xs">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={level}
                tone={
                  level === 'error' || level === 'critical'
                    ? 'destructive'
                    : level === 'warning'
                      ? 'warning'
                      : 'secondary'
                }
              />
              {context ? <span className="text-muted-foreground font-mono">{context}</span> : null}
              {when ? <span className="text-muted-foreground ms-auto">{when}</span> : null}
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{message}</p>
          </li>
        )
      })}
    </ul>
  )
}
