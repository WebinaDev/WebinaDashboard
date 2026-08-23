import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function TapsishopConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="tapsishop"
        titleKey="wnc.modules.tapsishop.title"
        subtitleKey="wnc.modules.tapsishop.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
