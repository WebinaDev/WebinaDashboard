import type { CoffeeOrigin } from '../types'

function isoToFlag(iso: string): string {
  const u = iso.toUpperCase()
  if (!/^[A-Z]{2}$/.test(u)) return ''
  return String.fromCodePoint(...[...u].map((c) => 127397 + c.charCodeAt(0)))
}

export function CoffeeFlag({
  origin,
  useFlagcdn = true,
  className = 'size-5 rounded-sm object-cover',
}: {
  origin: Pick<CoffeeOrigin, 'iso_code' | 'flag_emoji' | 'flag_url' | 'thumbnail_url' | 'name'>
  useFlagcdn?: boolean
  className?: string
}) {
  const iso = (origin.iso_code || '').toLowerCase()
  if (origin.thumbnail_url) {
    return <img src={origin.thumbnail_url} alt="" className={className} />
  }
  if (origin.flag_url) {
    return <img src={origin.flag_url} alt="" className={className} />
  }
  if (useFlagcdn && /^[a-z]{2}$/.test(iso)) {
    return <img src={`https://flagcdn.com/w40/${iso}.png`} alt="" className={className} />
  }
  const emoji = origin.flag_emoji || isoToFlag(iso)
  if (emoji) {
    return (
      <span className="text-base leading-none" aria-hidden>
        {emoji}
      </span>
    )
  }
  return <span className="text-muted-foreground text-xs">—</span>
}
