import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type NeshanMapPickerProps = {
  lat: string
  lng: string
  onChange: (lat: string, lng: string) => void
  apiKey?: string
}

const TEHRAN: [number, number] = [35.6892, 51.389]

type LeafletMap = {
  on: (ev: string, fn: (e: { latlng: { lat: number; lng: number } }) => void) => void
  setView: (latlng: [number, number], zoom: number) => void
  remove: () => void
}

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  setLatLng: (latlng: [number, number]) => void
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(el)
  })
}

function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = href
  document.head.appendChild(el)
}

export function NeshanMapPicker({ lat, lng, onChange, apiKey }: NeshanMapPickerProps) {
  const { t } = useTranslation()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)

  useEffect(() => {
    if (!apiKey || !hostRef.current) return
    let cancelled = false

    async function boot() {
      loadCss('https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css')
      try {
        await loadScript('https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js')
      } catch {
        return
      }
      if (cancelled || !hostRef.current) return
      const L = (window as unknown as { L?: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => LeafletMap
        marker: (latlng: [number, number]) => LeafletMarker
      } }).L
      if (!L) return
      const startLat = lat !== '' && Number.isFinite(Number(lat)) ? Number(lat) : TEHRAN[0]
      const startLng = lng !== '' && Number.isFinite(Number(lng)) ? Number(lng) : TEHRAN[1]
      const map = new L.Map(hostRef.current, {
        key: apiKey,
        maptype: 'neshan',
        poi: true,
        traffic: false,
        center: [startLat, startLng],
        zoom: 14,
      })
      mapRef.current = map
      const marker = L.marker([startLat, startLng]).addTo(map)
      markerRef.current = marker
      map.on('click', (e) => {
        const next: [number, number] = [e.latlng.lat, e.latlng.lng]
        marker.setLatLng(next)
        onChange(String(next[0]), String(next[1]))
      })
    }

    void boot()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Recreate only when the key appears; pin updates via inputs below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return
    if (lat === '' || lng === '') return
    const next: [number, number] = [Number(lat), Number(lng)]
    if (!Number.isFinite(next[0]) || !Number.isFinite(next[1])) return
    markerRef.current.setLatLng(next)
    mapRef.current.setView(next, 14)
  }, [lat, lng])

  return (
    <div className="space-y-2">
      {apiKey ? <div ref={hostRef} className="h-56 w-full overflow-hidden rounded-md border" /> : null}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{t('users.addr.lat')}</Label>
          <Input
            className="mt-1"
            value={lat}
            onChange={(e) => onChange(e.target.value, lng)}
            inputMode="decimal"
          />
        </div>
        <div>
          <Label className="text-xs">{t('users.addr.lng')}</Label>
          <Input
            className="mt-1"
            value={lng}
            onChange={(e) => onChange(lat, e.target.value)}
            inputMode="decimal"
          />
        </div>
      </div>
    </div>
  )
}
