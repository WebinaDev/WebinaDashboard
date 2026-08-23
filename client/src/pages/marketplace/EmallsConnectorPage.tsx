import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function EmallsConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="emalls"
        titleKey="wnc.modules.emalls.title"
        subtitleKey="wnc.modules.emalls.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
