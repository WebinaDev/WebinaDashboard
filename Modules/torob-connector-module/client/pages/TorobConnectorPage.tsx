import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function TorobConnectorPage() {
  return (
    <WncPlatformPanel
      platform="torob"
      titleKey="wnc.modules.torob.title"
      subtitleKey="wnc.modules.torob.subtitle"
      feedPlatform
    />
  )
}
