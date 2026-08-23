import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function SnappshopConnectorPage() {
  return (
    <WncPlatformPanel
      platform="snappshop"
      titleKey="wnc.modules.snappshop.title"
      subtitleKey="wnc.modules.snappshop.subtitle"
      feedPlatform={false}
    />
  )
}
