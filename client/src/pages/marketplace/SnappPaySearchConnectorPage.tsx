import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function SnappPaySearchConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="snapppay-search"
        titleKey="wnc.modules.snapppay-search.title"
        subtitleKey="wnc.modules.snapppay-search.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
