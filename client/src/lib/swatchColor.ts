export function isLightHex(hex?: string): boolean {
  const raw = (hex ?? '').trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return false
  const h = raw.slice(1)
  const full =
    h.length === 3 ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 210
}
