import type { TFunction } from 'i18next'

const TOMAN_LABEL = /تومان|toman|irt/i

/** Decode HTML entities commonly left in stripped WooCommerce price HTML. */
export function decodePriceEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#x0*a0;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number(n)
      return Number.isFinite(code) ? String.fromCharCode(code) : _
    })
    .replace(/\u00a0/g, ' ')
}

export function isTomanCurrency(codeOrLabel: string | undefined | null, symbol?: string | null): boolean {
  const code = (codeOrLabel ?? '').trim()
  const sym = (symbol ?? '').trim()
  if (!code && !sym) return false
  const upper = code.toUpperCase()
  if (upper === 'IRT' || upper === 'TOMAN') return true
  if (TOMAN_LABEL.test(code) || TOMAN_LABEL.test(sym)) return true
  return false
}

export function parseWcPriceText(text: string): { amount: string; isToman: boolean } {
  const raw = decodePriceEntities(text).trim()
  if (!raw) return { amount: '', isToman: false }
  if (TOMAN_LABEL.test(raw)) {
    const amount = raw.replace(TOMAN_LABEL, '').replace(/\s+/g, ' ').trim()
    return { amount, isToman: true }
  }
  // Numeric-only with separators → treat as toman when locale store is IRT (caller often wraps with MoneyDisplay).
  if (/^[\d\s.,٬٫]+$/.test(raw)) {
    return { amount: raw.replace(/\s+/g, ' ').trim(), isToman: false }
  }
  return { amount: raw, isToman: false }
}

/**
 * @deprecated Prefer MoneyDisplay / IrtIcon. Kept for non-price labels only.
 * For toman returns empty string so callers can render IrtIcon instead of text.
 */
export function formatMarketplaceCurrency(code: string | undefined | null, t: TFunction): string {
  const upper = (code ?? 'IRT').trim().toUpperCase()
  if (upper === 'IRT' || upper === 'TOMAN') return ''
  if (upper === 'IRR' || upper === 'RIAL') return t('shopBot.currency.rial')
  return code?.trim() || ''
}
