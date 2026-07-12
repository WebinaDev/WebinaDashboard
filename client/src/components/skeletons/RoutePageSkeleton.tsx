import { useLocation } from 'react-router-dom'

import { HomeOverviewSkeleton } from '@/components/home/HomeOverviewSkeleton'

import { CardGridSkeleton } from './CardGridSkeleton'
import { DetailTwoColumnSkeleton } from './DetailTwoColumnSkeleton'
import { EditorPageSkeleton } from './EditorPageSkeleton'
import { FormSettingsSkeleton } from './FormSettingsSkeleton'
import { ListPageSkeleton } from './ListPageSkeleton'
import { MediaGridSkeleton } from './MediaGridSkeleton'
import { ReportsDashboardSkeleton } from './ReportsDashboardSkeleton'
import { resolveSkeletonVariant } from './resolveSkeletonVariant'

export function RoutePageSkeleton() {
  const { pathname } = useLocation()
  const variant = resolveSkeletonVariant(pathname)

  switch (variant) {
    case 'dashboard':
      return <HomeOverviewSkeleton />
    case 'editor':
      return <EditorPageSkeleton />
    case 'reports':
      return <ReportsDashboardSkeleton />
    case 'settingsForm':
      return <FormSettingsSkeleton />
    case 'cardGrid':
      return <CardGridSkeleton />
    case 'mediaGrid':
      return <MediaGridSkeleton />
    case 'detail':
      return <DetailTwoColumnSkeleton />
    case 'list':
    default:
      return <ListPageSkeleton />
  }
}
