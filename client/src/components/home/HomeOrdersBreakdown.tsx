import { useTranslation } from 'react-i18next'

import { HourlyOrdersChart } from '@/components/orders/reports/HourlyOrdersChart'
import { PaymentBarChart } from '@/components/orders/reports/PaymentBarChart'
import { StatusPieChart } from '@/components/orders/reports/StatusPieChart'
import type { OrderReportHourRow, OrderReportPaymentRow, OrderReportStatusRow } from '@/types/orderReports'

type HomeOrdersBreakdownProps = {
  locale: string
  byStatus: OrderReportStatusRow[]
  byPayment: OrderReportPaymentRow[]
  byHour: OrderReportHourRow[]
}

export function HomeOrdersBreakdown({ locale, byStatus, byPayment, byHour }: HomeOrdersBreakdownProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight">{t('home.sections.breakdown')}</h2>
      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <div className="min-w-0">
          <StatusPieChart rows={byStatus} />
        </div>
        <div className="min-w-0">
          <PaymentBarChart rows={byPayment} locale={locale} />
        </div>
        <div className="min-w-0">
          <HourlyOrdersChart rows={byHour} locale={locale} />
        </div>
      </div>
    </section>
  )
}
