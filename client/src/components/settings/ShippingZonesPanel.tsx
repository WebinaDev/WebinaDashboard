import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, MapPin, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer } from '@/components/settings/WcSettingsFormRenderer'
import type { ShippingZoneRow, WcSettingsField } from '@/components/settings/wc-settings-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { getSsrPage } from '@/lib/ssrPage'
import { cn } from '@/lib/utils'

type ZoneLocation = { type: string; code: string }

type ShippingMethodRow = {
  id: string
  method_id: string
  instance_id: number
  title: string
  enabled: boolean
  cost?: string
  fields?: WcSettingsField[]
  settings?: Record<string, unknown>
}

type ZoneRow = Omit<ShippingZoneRow, 'methods' | 'locations'> & {
  locations: ZoneLocation[]
  methods: ShippingMethodRow[]
}

type ShippingResponse = {
  zones: ZoneRow[]
  global: { fields: WcSettingsField[]; values: Record<string, unknown> } | null
}

type MethodType = { id: string; title: string; description: string }

const IR_STATES: { code: string; name: string }[] = [
  { code: 'IR:TE', name: 'تهران' },
  { code: 'IR:AL', name: 'البرز' },
  { code: 'IR:IS', name: 'اصفهان' },
  { code: 'IR:FA', name: 'فارس' },
  { code: 'IR:KV', name: 'خراسان رضوی' },
  { code: 'IR:KZ', name: 'خوزستان' },
  { code: 'IR:AE', name: 'آذربایجان شرقی' },
  { code: 'IR:AW', name: 'آذربایجان غربی' },
  { code: 'IR:MN', name: 'مازندران' },
  { code: 'IR:GI', name: 'گیلان' },
  { code: 'IR:GO', name: 'گلستان' },
  { code: 'IR:QM', name: 'قم' },
  { code: 'IR:QZ', name: 'قزوین' },
  { code: 'IR:MK', name: 'مرکزی' },
  { code: 'IR:HD', name: 'همدان' },
  { code: 'IR:YA', name: 'یزد' },
  { code: 'IR:KE', name: 'کرمان' },
  { code: 'IR:BK', name: 'کرمانشاه' },
  { code: 'IR:LO', name: 'لرستان' },
  { code: 'IR:HG', name: 'هرمزگان' },
  { code: 'IR:BU', name: 'بوشهر' },
  { code: 'IR:SB', name: 'سیستان و بلوچستان' },
  { code: 'IR:AR', name: 'اردبیل' },
  { code: 'IR:ZA', name: 'زنجان' },
  { code: 'IR:SM', name: 'سمنان' },
  { code: 'IR:IL', name: 'ایلام' },
  { code: 'IR:CM', name: 'چهارمحال و بختیاری' },
  { code: 'IR:KB', name: 'کهگیلویه و بویراحمد' },
  { code: 'IR:KD', name: 'کردستان' },
  { code: 'IR:KS', name: 'خراسان شمالی' },
  { code: 'IR:KJ', name: 'خراسان جنوبی' },
]

export function ShippingZonesPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [globalDraft, setGlobalDraft] = useState<Record<string, unknown>>({})
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null)
  const [zoneName, setZoneName] = useState('')
  const [locCountry, setLocCountry] = useState(true)
  const [locStates, setLocStates] = useState<string[]>([])
  const [postcode, setPostcode] = useState('')
  const [activeMethodId, setActiveMethodId] = useState<number | null>(null)
  const [methodEnabled, setMethodEnabled] = useState(true)
  const [methodDraft, setMethodDraft] = useState<Record<string, unknown>>({})
  const [addMethodId, setAddMethodId] = useState('')
  const initial = useMemo(() => getSsrPage()?.shippingZones as ShippingResponse | undefined, [])

  const q = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => apiFetch<ShippingResponse>('shop/shipping/zones'),
    initialData: initial,
    staleTime: initial ? 90_000 : undefined,
    refetchOnMount: initial ? false : true,
  })
  useQueryErrorToast(q)

  const typesQ = useQuery({
    queryKey: ['shipping-method-types'],
    queryFn: () => apiFetch<{ methods: MethodType[] }>('shop/shipping/method-types'),
    enabled: activeZoneId !== null,
  })

  useEffect(() => {
    if (q.data?.global?.values) setGlobalDraft({ ...q.data.global.values })
  }, [q.data?.global?.values])

  const zones = q.data?.zones ?? []
  const activeZone = zones.find((z) => z.id === activeZoneId) ?? null
  const activeMethod =
    activeZone?.methods.find((m) => m.instance_id === activeMethodId) ?? activeZone?.methods[0] ?? null

  useEffect(() => {
    if (!activeZone) return
    setZoneName(activeZone.name)
    const locs = activeZone.locations || []
    setLocCountry(locs.some((l) => l.type === 'country' && l.code === 'IR'))
    setLocStates(locs.filter((l) => l.type === 'state').map((l) => l.code))
    const pc = locs.find((l) => l.type === 'postcode')
    setPostcode(pc?.code ?? '')
  }, [activeZone?.id, q.data])

  useEffect(() => {
    if (!activeMethod) {
      setActiveMethodId(null)
      setMethodDraft({})
      return
    }
    setActiveMethodId(activeMethod.instance_id)
    setMethodEnabled(activeMethod.enabled)
    setMethodDraft({ ...(activeMethod.settings || {}) })
  }, [activeMethod?.instance_id, activeZone?.id, q.data])

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['shipping-zones'] })

  const create = useMutation({
    mutationFn: () =>
      apiFetch('shop/shipping/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      }),
    onSuccess: () => {
      setNewName('')
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`shop/shipping/zones/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      setActiveZoneId(null)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveZone = useMutation({
    mutationFn: () => {
      const locations: ZoneLocation[] = []
      if (locCountry) locations.push({ type: 'country', code: 'IR' })
      for (const code of locStates) locations.push({ type: 'state', code })
      if (postcode.trim()) locations.push({ type: 'postcode', code: postcode.trim() })
      return apiFetch(`shop/shipping/zones/${activeZoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: zoneName.trim(), locations }),
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const addMethod = useMutation({
    mutationFn: () =>
      apiFetch(`shop/shipping/zones/${activeZoneId}/methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method_id: addMethodId }),
      }),
    onSuccess: () => {
      setAddMethodId('')
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveMethod = useMutation({
    mutationFn: () =>
      apiFetch(`shop/shipping/zones/${activeZoneId}/methods/${activeMethod?.instance_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: methodEnabled, settings: methodDraft }),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const deleteMethod = useMutation({
    mutationFn: (instanceId: number) =>
      apiFetch(`shop/shipping/zones/${activeZoneId}/methods/${instanceId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('common.deleted'))
      setActiveMethodId(null)
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const saveGlobal = useMutation({
    mutationFn: () =>
      apiFetch('shop/wc-settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalDraft),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      invalidate()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const global = q.data?.global
  const methodTypes = typesQ.data?.methods ?? []

  if (activeZone) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setActiveZoneId(null)}>
            <ArrowRight className="size-4 rotate-180" />
            {t('common.back')}
          </Button>
          <h2 className="text-base font-semibold">{activeZone.name}</h2>
        </div>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base">{t('settings.shop.shippingEditZone')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('settings.shop.shippingZoneName')}</Label>
              <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} disabled={activeZone.id === 0} />
            </div>
            {activeZone.id > 0 ? (
              <div className="space-y-3">
                <Label>{t('settings.shop.shippingLocations')}</Label>
                <div className="bg-background/50 flex items-center gap-2 rounded-xl border px-3 py-3">
                  <Checkbox
                    id="loc-ir"
                    checked={locCountry}
                    onCheckedChange={(v) => setLocCountry(v === true)}
                  />
                  <Label htmlFor="loc-ir" className="cursor-pointer font-normal">
                    {t('settings.shop.shippingLocIran')}
                  </Label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {IR_STATES.map((s) => {
                    const checked = locStates.includes(s.code)
                    return (
                      <label
                        key={s.code}
                        className="bg-background/50 flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            setLocStates((prev) =>
                              v === true ? [...prev, s.code] : prev.filter((c) => c !== s.code),
                            )
                          }}
                        />
                        {s.name}
                      </label>
                    )
                  })}
                </div>
                <div className="space-y-1.5">
                  <Label>{t('settings.shop.shippingPostcode')}</Label>
                  <Input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="12345*"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t('settings.shop.shippingRestOfWorldHint')}</p>
            )}
            {activeZone.id > 0 ? (
              <Button type="button" disabled={saveZone.isPending || !zoneName.trim()} onClick={() => void saveZone.mutateAsync()}>
                {t('common.save')}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base">{t('settings.shop.shippingMethods')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={addMethodId || undefined} onValueChange={setAddMethodId}>
                <SelectTrigger className="min-w-[12rem] flex-1">
                  <SelectValue placeholder={t('settings.shop.shippingPickMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {methodTypes.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                disabled={!addMethodId || addMethod.isPending}
                onClick={() => void addMethod.mutateAsync()}
              >
                <Plus className="size-4" />
                {t('settings.shop.shippingAddMethod')}
              </Button>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
                {(activeZone.methods || []).map((m) => (
                  <button
                    key={m.instance_id}
                    type="button"
                    className={cn(
                      'flex min-w-[10rem] shrink-0 flex-col gap-1 rounded-xl border px-3 py-3 text-start transition-colors lg:min-w-0',
                      m.instance_id === activeMethod?.instance_id
                        ? 'border-primary/30 bg-primary/10'
                        : 'hover:bg-muted/60',
                    )}
                    onClick={() => setActiveMethodId(m.instance_id)}
                  >
                    <span className="text-sm font-medium">{m.title || m.method_id}</span>
                    {m.enabled ? (
                      <Badge className="w-fit text-[10px]">{t('settings.enabled')}</Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit text-[10px]">
                        {t('settings.disabled')}
                      </Badge>
                    )}
                  </button>
                ))}
                {!activeZone.methods?.length ? (
                  <p className="text-muted-foreground text-sm">{t('settings.shop.shippingNoMethods')}</p>
                ) : null}
              </div>

              {activeMethod ? (
                <Card className="min-w-0 flex-1">
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <CardTitle className="text-base">{activeMethod.title || activeMethod.method_id}</CardTitle>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={deleteMethod.isPending}
                      onClick={() => void deleteMethod.mutateAsync(activeMethod.instance_id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 flex items-center gap-2 rounded-xl border px-3 py-3">
                      <Checkbox
                        id="method-enabled"
                        checked={methodEnabled}
                        onCheckedChange={(v) => setMethodEnabled(v === true)}
                      />
                      <Label htmlFor="method-enabled" className="cursor-pointer font-normal">
                        {t('settings.shop.shippingMethodEnabled')}
                      </Label>
                    </div>
                    <WcSettingsFormRenderer
                      fields={activeMethod.fields || []}
                      values={methodDraft}
                      onChange={(id, v) => setMethodDraft((d) => ({ ...d, [id]: v }))}
                    />
                    <Button type="button" disabled={saveMethod.isPending} onClick={() => void saveMethod.mutateAsync()}>
                      {t('common.save')}
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">{t('settings.shop.sections.shipping')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[12rem] flex-1"
              placeholder={t('settings.shop.shippingNewZone')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="button" size="sm" disabled={!newName.trim() || create.isPending} onClick={() => void create.mutateAsync()}>
              {t('settings.shop.shippingAddZone')}
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {zones.map((z) => (
              <li key={z.id}>
                <Card className="py-4 shadow-soft">
                  <CardContent className="flex items-center justify-between gap-2 px-4">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-start"
                      onClick={() => setActiveZoneId(z.id)}
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <MapPin className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{z.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {t('settings.shop.shippingMethodCount', { count: z.method_count })}
                          {z.locations?.length
                            ? ` · ${t('settings.shop.shippingLocationCount', { count: z.locations.length })}`
                            : ''}
                        </p>
                      </div>
                    </button>
                    {z.id > 0 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        disabled={remove.isPending}
                        onClick={() => void remove.mutateAsync(z.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {global ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.shop.shippingOptions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WcSettingsFormRenderer
              fields={global.fields}
              values={globalDraft}
              onChange={(id, value) => setGlobalDraft((d) => ({ ...d, [id]: value }))}
            />
            <Button type="button" disabled={saveGlobal.isPending} onClick={() => void saveGlobal.mutateAsync()}>
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
