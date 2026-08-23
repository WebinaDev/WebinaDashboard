import type { ComponentType } from 'react'

import AiAttributesPage from './pages/AiAttributesPage'
import AiCalendarPage from './pages/AiCalendarPage'
import AiJobsPage from './pages/AiJobsPage'
import AiOverviewPage from './pages/AiOverviewPage'
import AiProductsPage from './pages/AiProductsPage'
import AiSettingsPage from './pages/AiSettingsPage'
import AiTaxonomiesPage from './pages/AiTaxonomiesPage'

export const routes: Record<string, ComponentType> = {
  'ai-content': AiOverviewPage,
  'ai-content/jobs': AiJobsPage,
  'ai-content/calendar': AiCalendarPage,
  'ai-content/products': AiProductsPage,
  'ai-content/taxonomies': AiTaxonomiesPage,
  'ai-content/attributes': AiAttributesPage,
  'ai-content/settings': AiSettingsPage,
}

export default { routes }
