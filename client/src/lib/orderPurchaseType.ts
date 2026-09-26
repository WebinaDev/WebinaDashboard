/** Resolve WFCP purchase type for an order (mirrors PHP fulfillment_purchase_type). */
export function resolveOrderPurchaseType(order: {
  purchase_type?: string
  items?: Array<{ attributes?: { key: string; value: string }[] }>
}): string {
  const top = (order.purchase_type || '').trim().toLowerCase()
  if (top) return top
  for (const item of order.items ?? []) {
    for (const attr of item.attributes ?? []) {
      const key = attr.key.replace(/^_/, '').toLowerCase()
      if (key === 'wfcp_purchase_type' || key === 'purchase_type') {
        const v = attr.value.trim().toLowerCase()
        if (v) return v
      }
    }
  }
  return 'cash'
}

export function isInstallmentOrder(order: {
  purchase_type?: string
  items?: Array<{ attributes?: { key: string; value: string }[] }>
}): boolean {
  return resolveOrderPurchaseType(order) === 'installment'
}
