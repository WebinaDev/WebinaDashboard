function cfg() {
  return window.webinoDashboard
}

function withNonce(pathAndQuery: string): string {
  const c = cfg()
  const base = c.restUrl + pathAndQuery
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}_wpnonce=${encodeURIComponent(c.nonce)}`
}

export function orderPrintUrl(
  orderId: number,
  type: 'invoice' | 'label' | 'receipt' | 'packing' | 'customer_label' | 'store_label',
): string {
  return withNonce(`orders/${orderId}/print?type=${type}`)
}

export function unprintedLabelsPrintUrl(): string {
  return withNonce('orders/print-labels?scope=unprinted')
}

export function productLabelsPrintUrl(ids: number[]): string {
  const unique = [...new Set(ids.filter((id) => id > 0))]
  return withNonce(`shop/products/print-labels?ids=${unique.join(',')}`)
}

export function openOrderPrint(
  orderId: number,
  type: 'invoice' | 'label' | 'receipt' | 'packing' | 'customer_label' | 'store_label',
) {
  window.open(orderPrintUrl(orderId, type), '_blank', 'noopener,noreferrer')
}

export function openPrintDocument(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function openPrintDocumentChecked(url: string): Promise<'ok' | 'empty'> {
  const res = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'text/html' } })
  if (res.status === 404) return 'empty'
  if (!res.ok) {
    let message = 'Print failed'
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message)
  }
  const html = await res.text()
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) {
    throw new Error('popup')
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  return 'ok'
}
