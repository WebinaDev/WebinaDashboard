import { describe, expect, it } from 'vitest'

import { sanitizeEditorHtml } from './sanitizeEditorHtml'

describe('sanitizeEditorHtml', () => {
  it('strips script tags', () => {
    const out = sanitizeEditorHtml('<p>Hi</p><script>alert(1)</script>')
    expect(out).not.toContain('script')
    expect(out).toContain('<p>Hi</p>')
  })

  it('keeps justify, underline, and tables', () => {
    const html =
      '<p class="has-text-align-justify" style="text-align: justify">متن</p><p><u>زیرخط</u></p><table><tbody><tr><td>۱</td></tr></tbody></table>'
    const out = sanitizeEditorHtml(html)
    expect(out).toContain('has-text-align-justify')
    expect(out).toContain('<u>')
    expect(out).toContain('<table>')
    expect(out).toContain('<td>')
  })
})
