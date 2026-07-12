import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { MediaTermManager } from '@/components/media/MediaTermManager'

export default function MediaCategoriesPage() {
  const { t } = useTranslation()
  return (
    <PageShell title={t('media.categoriesTitle')} description={t('media.description')}>
      <MediaTermManager kind="category" />
    </PageShell>
  )
}
