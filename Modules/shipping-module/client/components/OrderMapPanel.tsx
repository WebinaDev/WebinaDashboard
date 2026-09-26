import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type MapSettings = {
  provider?: string
  neshan_api_key?: string
  mapp_api_key?: string
  store_location?: { lat?: number; lng?: number }
}

type MapPayload = {
  location: string
  lat: number
  lng: number
  settings?: MapSettings
}

type LeafletNs = {
  map: (el: HTMLElement) => LeafletMap
  tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (m: LeafletMap) => unknown }
  marker: (latlng: [number, number]) => LeafletMarker
}

type LeafletMap = {
  setView: (latlng: [number, number], zoom: number) => LeafletMap
  on: (event: string, fn: (e: { latlng: { lat: number; lng: number } }) => void) => void
  remove: () => void
  invalidateSize: () => void
}

type LeafletMarker = {
  addTo: (m: LeafletMap) => LeafletMarker
  setLatLng: (latlng: [number, number]) => void
}

declare global {
  interface Window {
    L?: LeafletNs
  }
}

let leafletPromise: Promise<LeafletNs> | null = null

function loadLeaflet(): Promise<LeafletNs> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('no window'))
  }
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    const cssId = 'webino-leaflet-css'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const existing = document.querySelector('script[data-webino-leaflet]')
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.L) resolve(window.L)
        else reject(new Error('Leaflet missing'))
      })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.dataset.webinoLeaflet = '1'
    script.onload = () => {
      if (window.L) {
        // Fix default marker icons when Leaflet is loaded from CDN without bundler assets.
        const LAny = window.L as LeafletNs & {
          Icon?: { Default?: { prototype: Record<string, unknown>; mergeOptions: (o: Record<string, string>) => void } }
        }
        try {
          if (LAny.Icon?.Default) {
            delete LAny.Icon.Default.prototype._getIconUrl
            LAny.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            })
          }
        } catch {
          /* ignore */
        }
        resolve(window.L)
      } else reject(new Error('Leaflet missing'))
    }
    script.onerror = () => reject(new Error('Leaflet failed to load'))
    document.head.appendChild(script)
  })
  return leafletPromise
}

function tileUrl(settings?: MapSettings): { url: string; attribution: string } {
  const provider = settings?.provider || 'osm'
  if (provider === 'neshan' && settings?.neshan_api_key) {
    return {
      url: 'https://static.neshan.org/raster/{z}/{x}/{y}.png',
      attribution: '© Neshan',
    }
  }
  if (provider === 'mapp' && settings?.mapp_api_key) {
    return {
      url: `https://map.ir/raster/styles/main/{z}/{x}/{y}?x-api-key=${encodeURIComponent(settings.mapp_api_key)}`,
      attribution: '© Map.ir',
    }
  }
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OSM',
  }
}

export function OrderMapPanel({ orderId }: { orderId: number }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const mapEl = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [mapReady, setMapReady] = useState(false)

  const q = useQuery({
    queryKey: ['shipping-order-map', orderId],
    queryFn: () => apiFetch<MapPayload>(`shipping/orders/${orderId}/map`),
    enabled: orderId > 0,
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data) {
      const store = q.data.settings?.store_location
      setLat(q.data.lat || store?.lat || 35.6892)
      setLng(q.data.lng || store?.lng || 51.389)
    }
  }, [q.data])

  useEffect(() => {
    let cancelled = false
    void loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current || mapRef.current) return
        const tile = tileUrl(q.data?.settings)
        const map = L.map(mapEl.current).setView([lat || 35.6892, lng || 51.389], 13)
        L.tileLayer(tile.url, { maxZoom: 19, attribution: tile.attribution }).addTo(map)
        map.on('click', (e) => {
          setLat(e.latlng.lat)
          setLng(e.latlng.lng)
        })
        mapRef.current = map
        setMapReady(true)
        requestAnimationFrame(() => map.invalidateSize())
      })
      .catch(() => {
        /* lat/lng inputs remain usable */
      })
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        setMapReady(false)
      }
    }
    // Init once when container + settings available
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount via key if needed
  }, [q.data?.settings?.provider, q.data?.settings?.neshan_api_key, q.data?.settings?.mapp_api_key])

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) return
    const L = window.L
    const pos: [number, number] = [lat, lng]
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return
    mapRef.current.setView(pos, mapRef.current ? 13 : 13)
    if (markerRef.current) {
      markerRef.current.setLatLng(pos)
    } else {
      markerRef.current = L.marker(pos).addTo(mapRef.current)
    }
  }, [lat, lng, mapReady])

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`shipping/orders/${orderId}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['shipping-order-map', orderId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('shipping.orderMapTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={mapEl}
          className="bg-muted h-64 w-full overflow-hidden rounded-md border z-0"
          dir="ltr"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Lat</Label>
            <Input
              type="number"
              step="any"
              dir="ltr"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label>Lng</Label>
            <Input
              type="number"
              step="any"
              dir="ltr"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        <Button type="button" size="sm" disabled={save.isPending} onClick={() => void save.mutate()}>
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  )
}
