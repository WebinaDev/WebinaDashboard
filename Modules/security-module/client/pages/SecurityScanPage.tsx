import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cancelScan, fetchScans, startScan } from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

const PROFILES = ['quick', 'standard', 'deep'] as const

export default function SecurityScanPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()

  const scansQ = useQuery({
    queryKey: ['security', 'scans'],
    queryFn: fetchScans,
    refetchInterval: (q) =>
      (q.state.data?.items ?? []).some((s) => s.status === 'queued' || s.status === 'running') ? 3000 : false,
  })
  useQueryErrorToast(scansQ)

  const start = useMutation({
    mutationFn: (profile: string) => startScan(profile),
    onSuccess: (data) => {
      toast.success(t('security.scanStarted'))
      void qc.invalidateQueries({ queryKey: ['security', 'scans'] })
      if (data.id) {
        window.location.hash = ''
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const cancel = useMutation({
    mutationFn: (id: number) => cancelScan(id),
    onSuccess: () => {
      toast.success(t('security.scanCancelled'))
      void qc.invalidateQueries({ queryKey: ['security', 'scans'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    try {
      return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(iso),
      )
    } catch {
      return iso
    }
  }

  const items = scansQ.data?.items ?? []

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Card>
        <CardHeader>
          <CardTitle>{t('security.startScan')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PROFILES.map((p) => (
            <Button key={p} variant="outline" disabled={start.isPending} onClick={() => void start.mutateAsync(p)}>
              {t(`security.scanProfile.${p}`)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.scheduleNoteTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <p className="text-sm text-muted-foreground">{t('security.scheduleNote')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.scanJobs')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {scansQ.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('security.noScans')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('security.col.profile')}</TableHead>
                  <TableHead>{t('security.col.status')}</TableHead>
                  <TableHead>{t('security.col.progress')}</TableHead>
                  <TableHead>{t('security.col.findings')}</TableHead>
                  <TableHead>{t('security.col.started')}</TableHead>
                  <TableHead className="text-right">{t('security.col.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>{scan.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{scan.profile}</Badge>
                    </TableCell>
                    <TableCell>
                      {t(`security.scanStatus.${scan.status}`, { defaultValue: scan.status })}
                    </TableCell>
                    <TableCell>{scan.progress_pct}%</TableCell>
                    <TableCell>{scan.findings_count}</TableCell>
                    <TableCell className="text-xs">{fmtDate(scan.started_at ?? scan.created_at)}</TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <Link to={`/security/scan/${scan.id}`}>{t('security.view')}</Link>
                      </Button>
                      {scan.status === 'running' || scan.status === 'queued' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancel.isPending}
                          onClick={() => void cancel.mutateAsync(scan.id)}
                        >
                          {t('security.cancel')}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
