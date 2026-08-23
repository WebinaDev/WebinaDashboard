import { SettingsModulesChrome } from '@/components/settings/SettingsModulesChrome'
import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function ZarehbinConnectorPage() {
  return (
    <SettingsModulesChrome>
      <WncPlatformPanel
        platform="zarehbin"
        titleKey="wnc.modules.zarehbin.title"
        subtitleKey="wnc.modules.zarehbin.subtitle"
        feedPlatform
        embedded
      />
    </SettingsModulesChrome>
  )
}
