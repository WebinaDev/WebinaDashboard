import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  fetchFindings,
  fetchScan,
  healApply,
  healPreview,
  healRollback,
  updateFinding,
  type FindingStatus,
  type SecurityFinding,
} from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

function severityVariant(sev: string): 'destructive' | 'secondary' | 'outline' {
  if (sev === 'critical' || sev === 'high') return 'destructive'
  if (sev === 'medium') return 'secondary'
  return 'outline'
}

function healActionFor(f: SecurityFinding): Record<string, unknown> | null {
  const path = f.path_or_object || ''
  if (!path) return null
  if (f.category === 'integrity' || path.startsWith('wp-includes/') || path.startsWith('wp-admin/')) {
    return { type: 'restore_core_file', path, target: path }
  }
  if (path.includes('wp-content/plugins/')) {
    const m = path.match(/wp-content\/plugins\/([^/]+)\//)
    return {
      type: 'restore_plugin_file',
      slug: m?.[1] ?? '',
      path: path.replace(/^.*wp-content\/plugins\/[^/]+\//, ''),
      target: path,
    }
  }
  return { type: 'quarantine_file', path, target: path }
}

export default function SecurityScanJobPage() {
  const { t } = useTranslation()
  const { jobid } = useParams<{ jobid: string }>()
  const id = Number(jobid)
  const qc = useQueryClient()
  const [selected, setSelected] = useState<number[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [lastSnapshot, setLastSnapshot] = useState<number | null>(null)

  const scanQ = useQuery({
    queryKey: ['security', 'scan', id],
    queryFn: () => fetchScan(id),
    enabled: Number.isFinite(id) && id > 0,
    refetchInterval: (q) =>
      q.state.data?.status === 'running' || q.state.data?.status === 'queued' ? 3000 : false,
  })
  useQueryErrorToast(scanQ)

  const findingsQ = useQuery({
    queryKey: ['security', 'findings', 'scan', id],
    queryFn: () => fetchFindings({ status: 'open', scan_id: id }),
    enabled: Number.isFinite(id) && id > 0,
  })
  useQueryErrorToast(findingsQ)

  const findings = useMemo(() => findingsQ.data?.items ?? [], [findingsQ.data?.items])

  const ack = useMutation({
    mutationFn: ({ findingId, status }: { findingId: number; status: FindingStatus }) =>
      updateFinding(findingId, status),
    onSuccess: () => {
      toast.success(t('security.findingUpdated'))
      void qc.invalidateQueries({ queryKey: ['security', 'findings'] })
      void qc.invalidateQueries({ queryKey: ['security', 'scan', id] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const previewM = useMutation({
    mutationFn: async () => {
      const actions = findings
        .filter((f) => selected.includes(f.id))
        .map(healActionFor)
        .filter(Boolean) as Record<string, unknown>[]
      if (actions.length === 0) throw new Error(t('security.healSelectFinding'))
      return healPreview(actions)
    },
    onSuccess: (data) => {
      setPreview(JSON.stringify(data, null, 2))
      setToken(String((data as { token?: string }).token ?? ''))
      toast.success(t('security.healPreviewDone'))
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const applyM = useMutation({
    mutationFn: async () => {
      const actions = findings
        .filter((f) => selected.includes(f.id))
        .map(healActionFor)
        .filter(Boolean) as Record<string, unknown>[]
      return healApply({ confirmation_token: token, actions })
    },
    onSuccess: (data) => {
      toast.success(t('security.healApplied'))
      const results = (data as { results?: Array<{ snapshot_id?: number }> }).results ?? []
      const snap = results.map((r) => r.snapshot_id).find((n) => typeof n === 'number' && n > 0)
      if (snap) setLastSnapshot(snap)
      setToken('')
      void qc.invalidateQueries({ queryKey: ['security', 'findings'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const rollbackM = useMutation({
    mutationFn: () => {
      if (!lastSnapshot) throw new Error(t('security.healNoSnapshot'))
      return healRollback(lastSnapshot)
    },
    onSuccess: () => {
      toast.success(t('security.healRolledBack'))
      setLastSnapshot(null)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const toggle = (fid: number, on: boolean) => {
    setSelected((prev) => (on ? [...prev, fid] : prev.filter((x) => x !== fid)))
  }

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="space-y-4">
        <SecurityShell />
        <p className="text-sm text-muted-foreground">{t('security.invalidScanId')}</p>
      </div>
    )
  }

  const scan = scanQ.data

  return (
    <div className="space-y-4">
      <SecurityShell />

      {scanQ.isPending ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : !scan ? (
        <p className="text-sm text-muted-foreground">{t('security.scanNotFound')}</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('security.scanJobTitle')} #{scan.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{scan.profile}</Badge>
              <Badge variant="outline">
                {t(`security.scanStatus.${scan.status}`, { defaultValue: scan.status })}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t('security.findingsCount', { count: scan.findings_count })}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t('security.col.progress')}</span>
                <span>{scan.progress_pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, scan.progress_pct))}%` }}
                />
              </div>
            </div>
            {scan.current_path ? (
              <p className="truncate font-mono text-xs text-muted-foreground">{scan.current_path}</p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('security.findingsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {findingsQ.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('security.noFindings')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>{t('security.col.severity')}</TableHead>
                  <TableHead>{t('security.col.title')}</TableHead>
                  <TableHead>{t('security.col.path')}</TableHead>
                  <TableHead>{t('security.col.status')}</TableHead>
                  <TableHead className="text-right">{t('security.col.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(f.id)}
                        onCheckedChange={(v) => toggle(f.id, Boolean(v))}
                        aria-label={t('security.healSelectFinding')}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(f.severity)} className="capitalize">
                        {t(`security.severity.${f.severity}`, { defaultValue: f.severity })}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{f.title}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs">{f.path_or_object}</TableCell>
                    <TableCell>{f.status}</TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ack.isPending}
                        onClick={() => void ack.mutateAsync({ findingId: f.id, status: 'acknowledged' })}
                      >
                        {t('security.ackFinding')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={ack.isPending}
                        onClick={() => void ack.mutateAsync({ findingId: f.id, status: 'ignored' })}
                      >
                        {t('security.ignoreFinding')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.healTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={previewM.isPending || selected.length === 0}
              onClick={() => void previewM.mutateAsync()}
            >
              {t('security.healPreview')}
            </Button>
            <Button disabled={applyM.isPending || !token} onClick={() => void applyM.mutateAsync()}>
              {t('security.healApply')}
            </Button>
            <Button
              variant="secondary"
              disabled={rollbackM.isPending || !lastSnapshot}
              onClick={() => void rollbackM.mutateAsync()}
            >
              {t('security.healRollback')}
            </Button>
          </div>
          {preview ? (
            <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{preview}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">{t('security.healSelectFinding')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
