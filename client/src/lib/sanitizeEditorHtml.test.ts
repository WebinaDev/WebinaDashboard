import { describe, expect, it } from 'vitest'

import { sanitizeEditorHtml } from './sanitizeEditorHtml'

describe('sanitizeEditorHtml', () => {
  it('strips script tags', () => {
    const out = sanitizeEditorHtml('<p>Hi</p><script>alert(1)</script>')
    expect(out).not.toContain('script')
    expect(out).toContain('<p>Hi</p>')
  })

  it('keeps basic formatting tags', () => {
    const out = sanitizeEditorHtml('<p><strong>Bold</strong></p>')
    expect(out).toContain('<strong>Bold</strong>')
  })
})
