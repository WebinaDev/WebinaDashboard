import { ModuleDynamicRoute } from '@/components/ModuleDynamicRoute'

/**
 * Host marketplace entry — loads basalam-module client when installed.
 * Keep this free of a hard @module-basalam import so dashboard builds
 * succeed when the optional marketplace package is not on disk.
 */
export default function BasalamConnectorPage() {
  return <ModuleDynamicRoute slug="basalam-module" routePath="basalam" />
}
