import { Navigate, useParams } from 'react-router-dom'

import { AnalyticsCommercePanel } from '@module-analytics/components/analytics/panels/AnalyticsCommercePanel'
import { AnalyticsComparePanel } from '@module-analytics/components/analytics/panels/AnalyticsComparePanel'
import { AnalyticsContentPanel } from '@module-analytics/components/analytics/panels/AnalyticsContentPanel'
import { AnalyticsDevicesPanel } from '@module-analytics/components/analytics/panels/AnalyticsDevicesPanel'
import { AnalyticsGeoPanel } from '@module-analytics/components/analytics/panels/AnalyticsGeoPanel'
import { AnalyticsMonthSummaryPanel } from '@module-analytics/components/analytics/panels/AnalyticsMonthSummaryPanel'
import { AnalyticsOverviewPanel } from '@module-analytics/components/analytics/panels/AnalyticsOverviewPanel'
import { AnalyticsPagesPanel } from '@module-analytics/components/analytics/panels/AnalyticsPagesPanel'
import { AnalyticsReferralsPanel } from '@module-analytics/components/analytics/panels/AnalyticsReferralsPanel'
import { AnalyticsSeoPanel } from '@module-analytics/components/analytics/panels/AnalyticsSeoPanel'
import { AnalyticsSupportPanel } from '@module-analytics/components/analytics/panels/AnalyticsSupportPanel'
import { AnalyticsVisitorsPanel } from '@module-analytics/components/analytics/panels/AnalyticsVisitorsPanel'
import { AnalyticsSectionLayout } from '@/layouts/AnalyticsSectionLayout'
import { isAnalyticsSection } from '@/lib/analytics-nav'

export default function AnalyticsShell() {
  const { section } = useParams<{ section: string }>()

  if (!isAnalyticsSection(section)) {
    return <Navigate to="/analytics/overview" replace />
  }

  return (
    <AnalyticsSectionLayout>
      {section === 'overview' ? <AnalyticsOverviewPanel /> : null}
      {section === 'visitors' ? <AnalyticsVisitorsPanel /> : null}
      {section === 'pages' ? <AnalyticsPagesPanel /> : null}
      {section === 'referrals' ? <AnalyticsReferralsPanel /> : null}
      {section === 'geo' ? <AnalyticsGeoPanel /> : null}
      {section === 'devices' ? <AnalyticsDevicesPanel /> : null}
      {section === 'commerce' ? <AnalyticsCommercePanel /> : null}
      {section === 'compare' ? <AnalyticsComparePanel /> : null}
      {section === 'seo' ? <AnalyticsSeoPanel /> : null}
      {section === 'support' ? <AnalyticsSupportPanel /> : null}
      {section === 'content' ? <AnalyticsContentPanel /> : null}
      {section === 'month-summary' ? <AnalyticsMonthSummaryPanel /> : null}
    </AnalyticsSectionLayout>
  )
}
