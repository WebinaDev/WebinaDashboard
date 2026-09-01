import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type ListResp<T> = { items: T[]; total: number }

function openHtml(html: string) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
}

export default function MyPayrollPage() {
  const { t } = useTranslation()
  const slipsQ = useQuery({
    queryKey: ['accounting', 'my-payslips'],
    queryFn: async () => apiFetch<ListResp<Record<string, unknown>>>('accounting/my/payslips'),
  })
  const decreesQ = useQuery({
    queryKey: ['accounting', 'my-decrees'],
    queryFn: async () => apiFetch<ListResp<Record<string, unknown>>>('accounting/my/decrees'),
  })

  const printSlip = async (id: number) => {
    try {
      const res = await apiFetch<{ html: string }>(`accounting/payslips/${id}/print`)
      openHtml(res.html)
    } catch (e) {
      toastApiError(t, e as Error)
    }
  }
  const printDecree = async (id: number) => {
    try {
      const res = await apiFetch<{ html: string }>(`accounting/decrees/${id}/print`)
      openHtml(res.html)
    } catch (e) {
      toastApiError(t, e as Error)
    }
  }

  return (
    <PageShell title={t('accounting.payroll.myPayroll')} description={t('accounting.payroll.myPayrollHelp')}>
      <section className="mb-6 space-y-2">
        <h2 className="text-sm font-medium">{t('accounting.payroll.payslips')}</h2>
        <div className="space-y-2">
          {(slipsQ.data?.items ?? []).map((s) => (
            <div key={String(s.id)} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>
                #{String(s.id)} — {String(s.gross ?? '')} / {String(s.net ?? '')}
              </span>
              <Button size="sm" variant="outline" onClick={() => void printSlip(Number(s.id))}>
                {t('accounting.payroll.print')}
              </Button>
            </div>
          ))}
          {!slipsQ.data?.items?.length ? <p className="text-muted-foreground text-sm">—</p> : null}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-medium">{t('accounting.payroll.decrees')}</h2>
        <div className="space-y-2">
          {(decreesQ.data?.items ?? []).map((d) => (
            <div key={String(d.id)} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>
                {String(d.decree_no)} — {String(d.decree_type)} — {String(d.status)}
              </span>
              <Button size="sm" variant="outline" onClick={() => void printDecree(Number(d.id))}>
                {t('accounting.payroll.print')}
              </Button>
            </div>
          ))}
          {!decreesQ.data?.items?.length ? <p className="text-muted-foreground text-sm">—</p> : null}
        </div>
      </section>
    </PageShell>
  )
}
