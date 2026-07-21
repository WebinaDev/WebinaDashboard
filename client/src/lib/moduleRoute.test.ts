import { describe, expect, it } from 'vitest'

import { isSafeModuleRoutePath, normalizeModuleRoutePath } from './moduleRoute'
import { normalizeModuleBundle, normalizeModuleEntryUrl } from './moduleRuntime'

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
