import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function TapsishopConnectorPage() {
  return (
    <WncPlatformPanel
      platform="tapsishop"
      titleKey="wnc.modules.tapsishop.title"
      subtitleKey="wnc.modules.tapsishop.subtitle"
      feedPlatform={false}
    />
  )
}
