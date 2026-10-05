import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/settings/shop/basalam', end: true, key: 'basalam.nav.connection' },
  { to: '/settings/shop/basalam/booth', key: 'basalam.nav.booth' },
  { to: '/settings/shop/basalam/products', key: 'basalam.nav.products' },
  { to: '/orders?marketplace=basalam', key: 'basalam.nav.orders', externalPath: true },
  { to: '/settings/shop/basalam/categories', key: 'basalam.nav.categories' },
  { to: '/settings/shop/basalam/settings', key: 'basalam.nav.settings' },
  { to: '/settings/shop/basalam/finance', key: 'basalam.nav.finance' },
  { to: '/settings/shop/basalam/logs', key: 'basalam.nav.logs' },
] as const

export function BasalamNav() {
  const { t } = useTranslation()
  const loc = useLocation()
  const path = loc.pathname.replace(/\/$/, '') || '/'

  return (
    <nav className="mb-4 flex flex-wrap gap-2" aria-label={t('basalam.title')}>
      {LINKS.map((item) => {
        const active = item.end
          ? path === '/settings/shop/basalam'
          : item.to.startsWith('/orders')
            ? path.startsWith('/orders') && loc.search.includes('marketplace=basalam')
            : path === item.to || path.startsWith(item.to + '/')
        return (
          <Button
            key={item.to}
            asChild
            size="sm"
            variant={active ? 'default' : 'outline'}
            className={cn(active && 'pointer-events-none')}
          >
            <Link to={item.to}>{t(item.key)}</Link>
          </Button>
        )
      })}
    </nav>
  )
}
