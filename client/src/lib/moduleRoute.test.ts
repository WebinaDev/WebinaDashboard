import { describe, expect, it } from 'vitest'

import { isSafeModuleRoutePath, normalizeModuleRoutePath } from './moduleRoute'
import { normalizeModuleBundle, normalizeModuleEntryUrl } from './moduleRuntime'

describe('moduleRoute', () => {
  it('accepts clean public paths without -module segments', () => {
    expect(isSafeModuleRoutePath('shop/wfcp/quick-add')).toBe(true)
    expect(isSafeModuleRoutePath('analytics/:section')).toBe(true)
    expect(isSafeModuleRoutePath('settings/shop/pricing/:tab')).toBe(true)
    expect(isSafeModuleRoutePath('settings/shop/basalam')).toBe(true)
  })

  it('normalizes leading slashes', () => {
    expect(normalizeModuleRoutePath('/shop/wfcp/quick-add')).toBe('shop/wfcp/quick-add')
    expect(isSafeModuleRoutePath('/shop/wfcp/quick-add')).toBe(true)
  })

  it('rejects unsafe paths', () => {
    expect(isSafeModuleRoutePath('../evil')).toBe(false)
    expect(isSafeModuleRoutePath('shop//evil')).toBe(false)
  })
})

describe('normalizeModuleEntryUrl', () => {
  it('rewrites legacy sibling Modules path to in-plugin path', () => {
    const input =
      'https://parisma.ir/wp-content/plugins/Modules/bale-bot-module/client/dist/module.js'
    const out = normalizeModuleEntryUrl(input)
    expect(out).toBe(
      `${window.location.origin}/wp-content/plugins/WebinaDashboard/Modules/bale-bot-module/client/dist/module.js`,
    )
  })

  it('forces same-origin for in-plugin module URLs', () => {
    const input =
      'http://other.example/wp-content/plugins/WebinaDashboard/Modules/wfcp-module/client/dist/module.js'
    const out = normalizeModuleEntryUrl(input)
    expect(out).toBe(
      `${window.location.origin}/wp-content/plugins/WebinaDashboard/Modules/wfcp-module/client/dist/module.js`,
    )
  })
})

describe('normalizeModuleBundle', () => {
  const Page = () => null

  it('converts array routes to record', () => {
    const bundle = normalizeModuleBundle({
      routes: [
        { path: 'settings/shop/basalam', element: Page },
        { path: 'settings/shop/basalam/payments', element: Page },
      ],
    })
    expect(bundle.routes?.['settings/shop/basalam']).toBe(Page)
    expect(bundle.routes?.['settings/shop/basalam/payments']).toBe(Page)
  })

  it('unwraps function default export', () => {
    const bundle = normalizeModuleBundle({
      default: () => ({ routes: { 'bots/bale': Page } }),
    })
    expect(bundle.routes?.['bots/bale']).toBe(Page)
  })
})
