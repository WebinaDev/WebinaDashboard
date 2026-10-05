import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { BasalamNav } from '../../components/BasalamNav'
import {
  basalamJobErrorLabel,
  basalamJobStatusLabel,
  basalamJobTime,
  basalamJobType,
  basalamJobTypeLabel,
  type BasalamJobLike,
} from '../../lib/basalamJobs'
import { PageShell } from '@/components/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { formatDisplayDateTime } from '@/lib/date'

export default function BasalamLogsPage() {
  const { t, i18n } = useTranslation()
  const jobsQ = useQuery({
    queryKey: ['basalam', 'jobs', 'all'],
    queryFn: () => apiFetch<{ jobs: BasalamJobLike[] }>('basalam/jobs'),
    refetchInterval: 8000,
  })

  const jobs = jobsQ.data?.jobs ?? []
  const pending = jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length
  const failed = jobs.filter((j) => j.status === 'failed').length
  const done = jobs.filter((j) => j.status === 'completed' || j.status === 'success').length

  return (
    <PageShell title={t('basalam.logsTitle')} description={t('basalam.logsSubtitle')}>
      <BasalamNav />
      <div className="mb-4 grid max-w-3xl gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('basalam.syncStatus.pending')}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{pending}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('basalam.syncStatus.done')}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{done}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('basalam.syncStatus.failed')}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{failed}</CardContent>
        </Card>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>{t('basalam.recentJobs')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start">
                <th className="py-2 pe-2">ID</th>
                <th className="py-2 pe-2">{t('basalam.col.type')}</th>
                <th className="py-2 pe-2">{t('basalam.col.status')}</th>
                <th className="py-2 pe-2">{t('basalam.col.time')}</th>
                <th className="py-2">{t('basalam.col.error')}</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={String(j.id)} className="border-b align-top">
                  <td className="py-2 pe-2">{j.id}</td>
                  <td className="py-2 pe-2">{basalamJobTypeLabel(basalamJobType(j), t)}</td>
                  <td className="py-2 pe-2">{basalamJobStatusLabel(j.status, t)}</td>
                  <td className="text-muted-foreground py-2 pe-2 text-xs">
                    {formatDisplayDateTime(basalamJobTime(j), i18n.language)}
                  </td>
                  <td className="text-muted-foreground max-w-md break-all py-2 text-xs">
                    {basalamJobErrorLabel(j.error_message, t)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!jobs.length ? <p className="text-muted-foreground mt-3 text-sm">{t('common.empty')}</p> : null}
        </CardContent>
      </Card>
    </PageShell>
  )
}
