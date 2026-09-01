import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { EmailNotificationsPanel } from '@/components/notifications/EmailNotificationsPanel'
import { OtpAuthSettingsPanel } from '@/components/notifications/OtpAuthSettingsPanel'
import { SiteNotificationsPanel } from '@/components/notifications/SiteNotificationsPanel'
import { ShopBotNotificationsPanel } from '@/components/settings/ShopBotNotificationsPanel'
import { ShopSmsNotificationsPanel } from '@/components/settings/ShopSmsNotificationsPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'

const TABS = ['site', 'sms', 'bale', 'telegram', 'email', 'otp'] as const
type TabId = (typeof TABS)[number]

function normalizeTab(raw: string | null): TabId {
  if (raw && (TABS as readonly string[]).includes(raw)) return raw as TabId
  return 'site'
}

export function NotificationsSettingsPanel() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = normalizeTab(params.get('tab'))
  const bq = useBootstrapQuery()
  const installed = bq.data?.installedModuleSlugs ?? []
  const smsInstalled = installed.includes('sms-panel-module')
  const baleInstalled = installed.includes('bale-bot-module')
  const telegramInstalled = installed.includes('telegram-bot-module')

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        const next = new URLSearchParams(params)
        next.set('tab', v)
        setParams(next, { replace: true })
      }}
      className="space-y-4"
    >
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="site">{t('notifications.tabs.site')}</TabsTrigger>
        <TabsTrigger value="sms">{t('notifications.tabs.sms')}</TabsTrigger>
        <TabsTrigger value="bale">{t('notifications.tabs.bale')}</TabsTrigger>
        <TabsTrigger value="telegram">{t('notifications.tabs.telegram')}</TabsTrigger>
        <TabsTrigger value="email">{t('notifications.tabs.email')}</TabsTrigger>
        <TabsTrigger value="otp">{t('notifications.tabs.otp')}</TabsTrigger>
      </TabsList>

      <TabsContent value="site">
        <SiteNotificationsPanel />
      </TabsContent>

      <TabsContent value="sms">
        {smsInstalled ? (
          <ShopSmsNotificationsPanel />
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('notifications.moduleMissing', { module: t('notifications.tabs.sms') })}{' '}
            <Link className="text-primary underline" to="/marketplace">
              {t('marketplace.title')}
            </Link>
          </p>
        )}
      </TabsContent>

      <TabsContent value="bale">
        {baleInstalled ? (
          <ShopBotNotificationsPanel lockedProvider="bale" />
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('notifications.moduleMissing', { module: t('notifications.tabs.bale') })}{' '}
            <Link className="text-primary underline" to="/marketplace">
              {t('marketplace.title')}
            </Link>
          </p>
        )}
      </TabsContent>

      <TabsContent value="telegram">
        {telegramInstalled ? (
          <ShopBotNotificationsPanel lockedProvider="telegram" />
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('notifications.moduleMissing', { module: t('notifications.tabs.telegram') })}{' '}
            <Link className="text-primary underline" to="/marketplace">
              {t('marketplace.title')}
            </Link>
          </p>
        )}
      </TabsContent>

      <TabsContent value="email">
        <EmailNotificationsPanel />
      </TabsContent>

      <TabsContent value="otp">
        <OtpAuthSettingsPanel />
      </TabsContent>
    </Tabs>
  )
}
