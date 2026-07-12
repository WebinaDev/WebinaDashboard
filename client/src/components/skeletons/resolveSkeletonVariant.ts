export type SkeletonVariant =
  | 'dashboard'
  | 'list'
  | 'editor'
  | 'reports'
  | 'settingsForm'
  | 'cardGrid'
  | 'mediaGrid'
  | 'detail'

/** Map dashboard pathname (without basename) to skeleton layout. */
export function resolveSkeletonVariant(pathname: string): SkeletonVariant {
  const p = pathname.replace(/\/$/, '') || '/'

  if (p === '/' || p === '') return 'dashboard'

  if (p.startsWith('/orders/reports') || p.startsWith('/analytics')) return 'reports'

  if (p.startsWith('/marketplace')) return 'cardGrid'

  if (p === '/media' || p.startsWith('/media/')) return 'mediaGrid'

  if (p.startsWith('/settings')) return 'settingsForm'

  if (
    p.includes('/new') ||
    /\/posts\/\d+/.test(p) ||
    /\/pages\/\d+/.test(p) ||
    /\/products\/\d+/.test(p) ||
    /\/brands\/\d+/.test(p) ||
    /\/product-categories\/\d+/.test(p) ||
    /\/attributes\/\d+/.test(p) ||
    /\/coupons\/\d+/.test(p)
  ) {
    return 'editor'
  }

  if (
    /\/orders\/\d+/.test(p) ||
    /\/users\/\d+/.test(p) ||
    (p.startsWith('/users/') && !p.endsWith('/list') && !p.endsWith('/new') && !p.endsWith('/comments'))
  ) {
    return 'detail'
  }

  if (p === '/marketing/sms' || p === '/marketing/sms/') return 'dashboard'

  if (p.startsWith('/marketing/sms')) return 'list'

  return 'list'
}
