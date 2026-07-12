import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/apiError'
import { resolveApiUrl } from '@/lib/api'

describe('resolveApiUrl', () => {
  const origin = window.location.origin

  beforeEach(() => {
    window.webinoDashboard = {
      restUrl: `${origin}/wp-json/webino-dashboard/v1/`,
      nonce: 'test',
      isLogged: false,
      allowedRemoteHosts: ['cdn.example.com'],
    } as typeof window.webinoDashboard
  })

  afterEach(() => {
    delete (window as { webinoDashboard?: unknown }).webinoDashboard
  })

  it('resolves relative REST paths', () => {
    expect(resolveApiUrl('bootstrap')).toBe(`${origin}/wp-json/webino-dashboard/v1/bootstrap`)
    expect(resolveApiUrl('/auth/session')).toBe(`${origin}/wp-json/webino-dashboard/v1/auth/session`)
  })

  it('allows same-origin absolute URLs', () => {
    expect(resolveApiUrl(`${origin}/wp-json/webino-dashboard/v1/bootstrap`)).toBe(
      `${origin}/wp-json/webino-dashboard/v1/bootstrap`,
    )
  })

  it('allows configured remote hosts', () => {
    expect(resolveApiUrl('https://cdn.example.com/assets/file.zip')).toBe(
      'https://cdn.example.com/assets/file.zip',
    )
  })

  it('blocks disallowed absolute URLs', () => {
    expect(() => resolveApiUrl('https://evil.example.net/steal')).toThrow(ApiError)
    try {
      resolveApiUrl('https://evil.example.net/steal')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).code).toBe('forbidden_url')
    }
  })
})
