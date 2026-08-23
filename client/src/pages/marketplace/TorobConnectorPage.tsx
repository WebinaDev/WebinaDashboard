import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function TorobConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="torob"
        titleKey="wnc.modules.torob.title"
        subtitleKey="wnc.modules.torob.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
