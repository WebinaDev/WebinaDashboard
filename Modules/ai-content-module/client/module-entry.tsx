import type { ComponentType } from 'react'

import AiAttributesPage from './pages/AiAttributesPage'
import AiBlogPage from './pages/AiBlogPage'
import AiCalendarPage from './pages/AiCalendarPage'
import AiJobsPage from './pages/AiJobsPage'
import AiOverviewPage from './pages/AiOverviewPage'
import AiPagesPage from './pages/AiPagesPage'
import AiProductsPage from './pages/AiProductsPage'
import AiSettingsPage from './pages/AiSettingsPage'
import AiTaxonomiesPage from './pages/AiTaxonomiesPage'
import AiTitlesPage from './pages/AiTitlesPage'

export const routes: Record<string, ComponentType> = {
  'ai-content': AiOverviewPage,
  'ai-content/jobs': AiJobsPage,
  'ai-content/calendar': AiCalendarPage,
  'ai-content/blog': AiBlogPage,
  'ai-content/products': AiProductsPage,
  'ai-content/titles': AiTitlesPage,
  'ai-content/pages': AiPagesPage,
  'ai-content/taxonomies': AiTaxonomiesPage,
  'ai-content/attributes': AiAttributesPage,
  'ai-content/settings': AiSettingsPage,
}

export default { routes }
