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

function ReportStructuredView({ payload }: { payload: unknown }) {
  const { t } = useTranslation()

  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>

  const title = typeof p.title === 'string' ? p.title : null
  const score = typeof p.score === 'number' ? p.score : null
  const summary = p.summary
  const summaryItems: string[] = Array.isArray(summary)
    ? summary.map(String)
    : typeof summary === 'string'
      ? [summary]
      : []
  const sections = Array.isArray(p.sections)
    ? (p.sections as Array<Record<string, unknown>>)
    : []

  // Derive remaining keys as generic sections
  const knownKeys = new Set(['title', 'score', 'summary', 'sections'])
  const extraKeys = Object.keys(p).filter((k) => !knownKeys.has(k))

  return (
    <div className="space-y-4">
      {(title || score !== null) && (
        <div className="flex flex-wrap items-center gap-3">
          {title ? <p className="text-base font-semibold">{title}</p> : null}
          {score !== null ? (
            <Badge variant="outline">
              {t('security.kpi.score')}: {score}
            </Badge>
          ) : null}
        </div>
      )}

      {summaryItems.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">{t('security.reportSummary', { defaultValue: 'Summary' })}</p>
          <ul className="space-y-1">
            {summaryItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sections.map((sec, i) => {
        const secTitle = typeof sec.title === 'string' ? sec.title : `Section ${i + 1}`
        const secItems = Array.isArray(sec.items) ? sec.items as unknown[] : []
        return (
          <div key={i} className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">{secTitle}</p>
            {secItems.length > 0 ? (
              <ul className="space-y-1">
                {secItems.map((item, j) => (
                  <li key={j} className="text-sm text-muted-foreground">
                    {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <pre className="text-xs text-muted-foreground">{JSON.stringify(sec, null, 2)}</pre>
            )}
          </div>
        )
      })}

      {extraKeys.map((key) => (
        <div key={key} className="rounded-md border p-3">
          <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</p>
          {Array.isArray(p[key]) ? (
            <ul className="space-y-1">
              {(p[key] as unknown[]).map((item, i) => (
                <li key={i} className="text-sm">
                  {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">{String(p[key])}</p>
          )}
        </div>
      ))}
    </div>
  )
}

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

  const handleDownload = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report.payload ?? report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webino-report-${id}.json`
    a.click()
    URL.revokeObjectURL(url)
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
            <CardContent className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">
                {t(`security.reportType.${report.report_type}`, { defaultValue: report.report_type })}
              </Badge>
              <Badge variant="outline">
                {t('security.kpi.score')}: {report.score}
              </Badge>
              <span className="text-muted-foreground">{fmtDate(report.created_at)}</span>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                {t('security.reportDownload', { defaultValue: 'Download JSON' })}
              </Button>
            </CardContent>
          </Card>

          {/* Structured payload rendering */}
          {report.payload && typeof report.payload === 'object' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('security.reportStructured', { defaultValue: 'Report details' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportStructuredView payload={report.payload} />
              </CardContent>
            </Card>
          )}

          {/* Raw JSON — collapsible */}
          <Card>
            <CardHeader>
              <CardTitle>{t('security.reportPayload')}</CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  {t('security.reportRawJson', { defaultValue: 'Show raw JSON' })}
                </summary>
                <pre className="mt-2 max-h-[560px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                  {JSON.stringify(report.payload ?? report, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
