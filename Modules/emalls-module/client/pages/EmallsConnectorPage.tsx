import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function EmallsConnectorPage() {
  return (
    <WncPlatformPanel
      platform="emalls"
      titleKey="wnc.modules.emalls.title"
      subtitleKey="wnc.modules.emalls.subtitle"
      feedPlatform
    />
  )
}
