import { describe, expect, it } from 'vitest'

import { isSafeModuleRoutePath, normalizeModuleRoutePath } from './moduleRoute'
import { normalizeModuleBundle } from './moduleRuntime'

describe('moduleRoute', () => {
  it('accepts manifest-style paths', () => {
    expect(isSafeModuleRoutePath('shop/wfcp-module/quick-add')).toBe(true)
    expect(isSafeModuleRoutePath('analytics-module/:section')).toBe(true)
    expect(isSafeModuleRoutePath('settings/wfcp-module/:tab')).toBe(true)
  })

  it('normalizes leading slashes', () => {
    expect(normalizeModuleRoutePath('/shop/wfcp-module/quick-add')).toBe('shop/wfcp-module/quick-add')
    expect(isSafeModuleRoutePath('/shop/wfcp-module/quick-add')).toBe(true)
  })

  it('rejects unsafe paths', () => {
    expect(isSafeModuleRoutePath('../evil')).toBe(false)
    expect(isSafeModuleRoutePath('shop//evil')).toBe(false)
  })
})

describe('normalizeModuleBundle', () => {
  const Page = () => null

  it('converts array routes to record', () => {
    const bundle = normalizeModuleBundle({
      routes: [
        { path: 'settings/shop/basalam-module', element: Page },
        { path: 'settings/shop/basalam-module/payments', element: Page },
      ],
    })
    expect(bundle.routes?.['settings/shop/basalam-module']).toBe(Page)
    expect(bundle.routes?.['settings/shop/basalam-module/payments']).toBe(Page)
  })

  it('unwraps function default export', () => {
    const bundle = normalizeModuleBundle({
      default: () => ({ routes: { 'bots/bale': Page } }),
    })
    expect(bundle.routes?.['bots/bale']).toBe(Page)
  })
})
