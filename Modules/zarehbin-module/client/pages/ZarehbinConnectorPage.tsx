import { WncPlatformPanel } from '@/components/wnc/WncPlatformPanel'

export default function ZarehbinConnectorPage() {
  return (
    <WncPlatformPanel
      platform="zarehbin"
      titleKey="wnc.modules.zarehbin.title"
      subtitleKey="wnc.modules.zarehbin.subtitle"
      feedPlatform
    />
  )
}
