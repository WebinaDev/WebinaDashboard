import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { path: '/security', key: 'navOverview' },
  { path: '/security/firewall', key: 'navFirewall' },
  { path: '/security/scan', key: 'navScan' },
  { path: '/security/tools', key: 'navTools' },
  { path: '/security/reports', key: 'navReports' },
  { path: '/security/settings', key: 'navSettings' },
] as const

export function SecurityShell() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <div className="flex flex-wrap gap-2">
      {NAV.map(({ path, key }) => {
        const active = pathname === path || (path !== '/security' && pathname.startsWith(path))
        return (
          <Button
            key={path}
            asChild
            variant={active ? 'secondary' : 'outline'}
            size="sm"
            className={cn(active && 'font-medium')}
          >
            <Link to={path}>{t(`security.${key}`)}</Link>
          </Button>
        )
      })}
    </div>
  )
}
