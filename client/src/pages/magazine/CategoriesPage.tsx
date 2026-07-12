import { useTranslation } from 'react-i18next'

import { CategoryManager } from '@/components/magazine/CategoryManager'
import { PageShell } from '@/components/PageShell'

export default function CategoriesPage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('categories.title')}>
      <CategoryManager selectable={false} compact={false} />
    </PageShell>
  )
}
