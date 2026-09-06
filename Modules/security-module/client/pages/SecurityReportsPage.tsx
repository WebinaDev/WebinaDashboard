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
import { fetchReports, generateReport, REPORT_TYPES } from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

export default function SecurityReportsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()

  const reportsQ = useQuery({
    queryKey: ['security', 'reports'],
    queryFn: fetchReports,
  })
  useQueryErrorToast(reportsQ)

  const gen = useMutation({
    mutationFn: (type: string) => generateReport(type),
    onSuccess: () => {
      toast.success(t('security.reportGenerated'))
      void qc.invalidateQueries({ queryKey: ['security', 'reports'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(iso),
      )
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Card>
        <CardHeader>
          <CardTitle>{t('security.generateReport')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              disabled={gen.isPending}
              onClick={() => void gen.mutateAsync(type)}
            >
              {t(`security.reportType.${type}`)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('security.generatedReports')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {reportsQ.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : (reportsQ.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('security.noReports')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('security.col.type')}</TableHead>
                  <TableHead>{t('security.col.title')}</TableHead>
                  <TableHead>{t('security.kpi.score')}</TableHead>
                  <TableHead>{t('security.col.created')}</TableHead>
                  <TableHead className="text-right">{t('security.col.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reportsQ.data?.items ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.report_type}</Badge>
                    </TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.score}</TableCell>
                    <TableCell className="text-xs">{fmtDate(row.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <Link to={`/security/reports/${row.id}`}>{t('security.view')}</Link>
                      </Button>
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
