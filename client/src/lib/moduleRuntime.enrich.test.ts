import { afterEach, describe, expect, it } from 'vitest'

import { enrichModuleImportError } from '@/lib/moduleRuntime'

describe('enrichModuleImportError', () => {
  afterEach(() => {
    document.getElementById('webino-dashboard-importmap')?.remove()
  })

  it('points at shared redeploy when import map is missing and h is not a function', () => {
    const err = enrichModuleImportError(new Error('h is not a function'))
    expect(err.message).toContain('h is not a function')
    expect(err.message).toContain('shared runtime / import map missing')
    expect(err.message).toContain('assets/dashboard-build/shared')
  })

  it('points at shared redeploy on Failed to resolve without import map', () => {
    const err = enrichModuleImportError(new Error('Failed to resolve module specifier "react"'))
    expect(err.message).toContain('shared runtime / import map missing')
  })

  it('leaves message unchanged when import map is present', () => {
    const el = document.createElement('script')
    el.type = 'importmap'
    el.id = 'webino-dashboard-importmap'
    document.head.appendChild(el)
    const err = enrichModuleImportError(new Error('h is not a function'))
    expect(err.message).toBe('h is not a function')
  })
})
