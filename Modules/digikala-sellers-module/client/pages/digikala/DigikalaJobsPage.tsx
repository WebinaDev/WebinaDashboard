import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { JobsTable, type JobLike } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

export default function DigikalaJobsPage() {
  const { t } = useTranslation()
  const jobsQ = useQuery({
    queryKey: ['digikala', 'jobs', 'page'],
    queryFn: () => apiFetch<{ jobs?: JobLike[] }>('digikala/jobs'),
    refetchInterval: 5000,
  })
  const jobs = jobsQ.data?.jobs ?? []
  return (
    <PageShell title={t('digikala.jobsTitle')} description={t('digikala.jobsSubtitle')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('digikala.jobsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <JobsTable
            jobs={jobs}
            emptyLabel={t('common.empty')}
            typeLabel={t('digikala.col.type', 'Type')}
            statusLabel={t('digikala.col.status', 'Status')}
            errorLabel={t('digikala.col.error', 'Error')}
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}
