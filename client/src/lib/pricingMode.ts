/** True when the pricing module (wfcp) is enabled; otherwise products use a single WooCommerce price. */
export function isWfcpPricingOn(): boolean {
  const flags = typeof window !== 'undefined' ? window.webinoDashboard?.flags : undefined
  if (!flags) return false
  return Boolean(flags.wfcpPricing ?? flags.wfcp)
}
