import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function TechnolifeConnectorPage() {
  return (
    <WncPlatformPanel
      platform="technolife"
      titleKey="wnc.modules.technolife.title"
      subtitleKey="wnc.modules.technolife.subtitle"
      feedPlatform={false}
    />
  )
}
