import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { fetchReport } from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

export default function SecurityReportDetailPage() {
  const { t, i18n } = useTranslation()
  const { reportid } = useParams<{ reportid: string }>()
  const id = Number(reportid)

  const reportQ = useQuery({
    queryKey: ['security', 'report', id],
    queryFn: () => fetchReport(id),
    enabled: Number.isFinite(id) && id > 0,
  })
  useQueryErrorToast(reportQ)

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="space-y-4">
        <SecurityShell />
        <p className="text-sm text-muted-foreground">{t('security.invalidReportId')}</p>
      </div>
    )
  }

  const report = reportQ.data

  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'full', timeStyle: 'short' }).format(
        new Date(iso),
      )
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Button asChild variant="ghost" size="sm">
        <Link to="/security/reports">{t('security.backToReports')}</Link>
      </Button>

      {reportQ.isPending ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !report ? (
        <p className="text-sm text-muted-foreground">{t('security.reportNotFound')}</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{report.title || t('security.reportDetailTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">{report.report_type}</Badge>
              <Badge variant="outline">
                {t('security.kpi.score')}: {report.score}
              </Badge>
              <span className="text-muted-foreground">{fmtDate(report.created_at)}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('security.reportPayload')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[560px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                {JSON.stringify(report.payload ?? report, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
