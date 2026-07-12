import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/PageShell'
import { MediaTermManager } from '@/components/media/MediaTermManager'

export default function MediaFoldersPage() {
  const { t } = useTranslation()
  return (
    <PageShell title={t('media.foldersTitle')} description={t('media.description')}>
      <MediaTermManager kind="folder" />
    </PageShell>
  )
}
