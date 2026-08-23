import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function TechnolifeConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="technolife"
        titleKey="wnc.modules.technolife.title"
        subtitleKey="wnc.modules.technolife.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
