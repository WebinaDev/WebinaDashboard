import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type State = { id: number; name: string; slug: string }
type Col = { key: string; label: string; method_id: string }
type Row = { id: number; name: string; prices: Record<string, string | number> }
type SearchItem = { id: number; name: string; parent: number; type: string }

export default function CitiesSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [stateId, setStateId] = useState(0)
  const [cityId, setCityId] = useState(0)
  const [districtName, setDistrictName] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [draftPrices, setDraftPrices] = useState<Record<string, Record<string, string>>>({})

  const treeQ = useQuery({
    queryKey: ['shipping-cities-tree'],
    queryFn: () => apiFetch<{ states: State[]; installed: boolean }>('shipping/cities/tree'),
  })
  useQueryErrorToast(treeQ)

  const bulkQ = useQuery({
    queryKey: ['shipping-cities-bulk', stateId],
    queryFn: () =>
      apiFetch<{ columns: Col[]; rows: Row[] }>(`shipping/cities/bulk/${stateId}`),
    enabled: stateId > 0,
  })
  useQueryErrorToast(bulkQ)

  const searchQry = useQuery({
    queryKey: ['shipping-cities-search', searchQ, stateId],
    queryFn: () =>
      apiFetch<{ items: SearchItem[] }>(
        `shipping/cities/search?q=${encodeURIComponent(searchQ)}&state=${stateId || 0}`
      ),
    enabled: searchQ.trim().length >= 2,
  })

  useEffect(() => {
    if (!bulkQ.data?.rows) return
    const next: Record<string, Record<string, string>> = {}
    for (const row of bulkQ.data.rows) {
      next[String(row.id)] = {}
      for (const [k, v] of Object.entries(row.prices || {})) {
        next[String(row.id)][k] = v == null ? '' : String(v)
      }
    }
    setDraftPrices(next)
  }, [bulkQ.data])

  useEffect(() => {
    setCityId(0)
    setDistrictName('')
  }, [stateId])

  const cityRows = useMemo(
    () => (bulkQ.data?.rows || []).filter((r) => !r.name.startsWith('—')),
    [bulkQ.data]
  )
  const districtRows = useMemo(() => {
    if (!cityId || !bulkQ.data?.rows) return []
    const all = bulkQ.data.rows
    const idx = all.findIndex((r) => r.id === cityId)
    if (idx < 0) return []
    const out: Row[] = []
    for (let i = idx + 1; i < all.length; i++) {
      if (!all[i].name.startsWith('—')) break
      out.push(all[i])
    }
    return out
  }, [bulkQ.data, cityId])

  const reinstall = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/cities/reinstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false }),
      }),
    onSuccess: (d) => {
      if (d.ok) toast.success(d.message)
      else toast.error(d.message)
      void qc.invalidateQueries({ queryKey: ['shipping-cities-tree'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`shipping/cities/bulk/${stateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: draftPrices }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['shipping-cities-bulk', stateId] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const createZones = useMutation({
    mutationFn: () => {
      const ids = cityRows.map((r) => r.id)
      return apiFetch('shipping/cities/create-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_ids: ids.slice(0, 20) }),
      })
    },
    onSuccess: () => toast.success(t('shipping.zonesCreated')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const addDistrict = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('shipping/cities/district', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_id: cityId, name: districtName }),
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        setDistrictName('')
        void qc.invalidateQueries({ queryKey: ['shipping-cities-bulk', stateId] })
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const deleteDistrict = useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: boolean; message: string }>(`shipping/cities/district/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (d) => {
      if (d.ok) {
        toast.success(d.message)
        void qc.invalidateQueries({ queryKey: ['shipping-cities-bulk', stateId] })
      } else toast.error(d.message)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const states = treeQ.data?.states ?? []
  const columns = bulkQ.data?.columns ?? []
  const rows = bulkQ.data?.rows ?? []

  return (
    <PageShell title={t('shipping.citiesTitle')} description={t('shipping.citiesHint')}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={reinstall.isPending} onClick={() => void reinstall.mutate()}>
          {t('shipping.reinstallCities')}
        </Button>
        {stateId > 0 && (
          <>
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutate()}>
              {t('common.save')}
            </Button>
            <Button type="button" variant="outline" disabled={createZones.isPending} onClick={() => void createZones.mutate()}>
              {t('shipping.createZonesFromCities')}
            </Button>
          </>
        )}
      </div>
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shipping.pickState')}</CardTitle>
          <CardDescription>
            {treeQ.data?.installed ? t('shipping.citiesInstalled') : t('shipping.citiesNotInstalled')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('tapin.province')}</Label>
            <Select
              value={stateId ? String(stateId) : undefined}
              onValueChange={(v) => setStateId(parseInt(v, 10) || 0)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('tapin.pickProvince')} />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('shipping.citySearch')}</Label>
            <Input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t('shipping.citySearchPlaceholder')}
            />
            {searchQry.data?.items?.length ? (
              <ul className="border-border max-h-40 overflow-auto rounded-md border text-sm">
                {searchQry.data.items.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      className="hover:bg-muted w-full px-2 py-1.5 text-start"
                      onClick={() => {
                        if (it.type === 'city' || it.type === 'district') {
                          if (stateId < 1 && it.parent) {
                            /* keep current state; user picks province first for bulk */
                          }
                          if (it.type === 'city') setCityId(it.id)
                          toast.message(`${it.name} (${it.type})`)
                        }
                      }}
                    >
                      {it.name}{' '}
                      <span className="text-muted-foreground text-xs">({it.type})</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {stateId > 0 && (
        <Card className="mb-4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('shipping.districtsTitle')}</CardTitle>
            <CardDescription>{t('shipping.districtsHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('tapin.city')}</Label>
                <Select
                  value={cityId ? String(cityId) : undefined}
                  onValueChange={(v) => setCityId(parseInt(v, 10) || 0)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('tapin.pickCity')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cityRows.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label>{t('shipping.districtName')}</Label>
                  <Input
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    disabled={!cityId}
                  />
                </div>
                <Button
                  type="button"
                  disabled={!cityId || !districtName.trim() || addDistrict.isPending}
                  onClick={() => void addDistrict.mutate()}
                >
                  {t('shipping.addDistrict')}
                </Button>
              </div>
            </div>
            {cityId > 0 && (
              <ul className="divide-border divide-y text-sm">
                {districtRows.length === 0 ? (
                  <li className="text-muted-foreground py-2">{t('shipping.noDistricts')}</li>
                ) : (
                  districtRows.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                      <span>{d.name.replace(/^—\s*/, '')}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={deleteDistrict.isPending}
                        onClick={() => void deleteDistrict.mutate(d.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {stateId > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('shipping.bulkPrices')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {bulkQ.isPending ? (
              <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
            ) : (
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="p-2 text-start">{t('tapin.city')}</th>
                    {columns.map((c) => (
                      <th key={c.key} className="p-2 text-start whitespace-nowrap">
                        {c.label}
                        {c.method_id.includes('tipax') ? ` / ${t('shipping.tipaxOn')}` : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="p-2 whitespace-nowrap">{row.name}</td>
                      {columns.map((c) => (
                        <td key={c.key} className="p-2 align-top">
                          <Input
                            className="mb-1 h-8"
                            dir="ltr"
                            value={draftPrices[String(row.id)]?.[c.key] ?? ''}
                            onChange={(e) =>
                              setDraftPrices((prev) => ({
                                ...prev,
                                [String(row.id)]: {
                                  ...(prev[String(row.id)] || {}),
                                  [c.key]: e.target.value,
                                },
                              }))
                            }
                          />
                          {c.method_id.includes('tipax') && (
                            <label className="text-muted-foreground flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={draftPrices[String(row.id)]?.[`${c.key}_on`] === '1'}
                                onChange={(e) =>
                                  setDraftPrices((prev) => ({
                                    ...prev,
                                    [String(row.id)]: {
                                      ...(prev[String(row.id)] || {}),
                                      [`${c.key}_on`]: e.target.checked ? '1' : '',
                                    },
                                  }))
                                }
                              />
                              {t('shipping.tipaxOn')}
                            </label>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
