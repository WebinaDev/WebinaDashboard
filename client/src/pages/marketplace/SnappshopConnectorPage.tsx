import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function SnappshopConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="snappshop"
        titleKey="wnc.modules.snappshop.title"
        subtitleKey="wnc.modules.snappshop.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
