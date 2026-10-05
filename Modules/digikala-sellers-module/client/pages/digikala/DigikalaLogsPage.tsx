import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { LogRows, PhaseCoverageCards } from '@/components/data/DumpUi'
import { PageShell } from '@/components/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

export default function DigikalaLogsPage() {
  const { t } = useTranslation()
  const logsQ = useQuery({
    queryKey: ['digikala', 'logs'],
    queryFn: () => apiFetch<{ items?: Record<string, unknown>[]; logs?: Record<string, unknown>[] }>('digikala/logs'),
  })
  const covQ = useQuery({
    queryKey: ['digikala', 'coverage'],
    queryFn: () => apiFetch<Record<string, unknown>>('digikala/coverage'),
  })
  const items = logsQ.data?.items ?? logsQ.data?.logs ?? []
  return (
    <PageShell title={t('digikala.logsTitle')} description={t('digikala.logsSubtitle')}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('digikala.coverage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PhaseCoverageCards data={covQ.data} emptyLabel={t('common.empty')} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('digikala.logsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LogRows items={items} emptyLabel={t('common.empty')} />
        </CardContent>
      </Card>
    </PageShell>
  )
}
