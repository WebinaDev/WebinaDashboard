import { useTranslation } from 'react-i18next'

import { BotCampaignsPanel } from '../../components/bots/BotCampaignsPanel'
import { BotProviderSwitcher } from '../../components/bots/BotProviderSwitcher'
import { useBotProvider } from '../../components/bots/useBotProvider'
import { PageShell } from '@/components/PageShell'
import { Card, CardContent } from '@/components/ui/card'

export default function BotCampaignsPage() {
  const { t } = useTranslation()
  const { provider, setProvider } = useBotProvider('bale')

  return (
    <PageShell title={t('marketing.botCampaigns')} description={t('bots.description')}>
      <Card className="mb-4 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <BotProviderSwitcher provider={provider} onChange={setProvider} />
        </CardContent>
      </Card>
      <BotCampaignsPanel provider={provider} />
    </PageShell>
  )
}
