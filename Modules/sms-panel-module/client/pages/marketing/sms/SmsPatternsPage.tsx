import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  createSmsPattern,
  detachSmsPattern,
  fetchShopSmsSettings,
  fetchSmsPattern,
  fetchSmsPatternRegistry,
  fetchSmsPatterns,
  saveShopSmsSettings,
  saveSmsTemplates,
  syncSmsPattern,
  testOrderSmsNotify,
  type ShopSmsSettings,
  type SmsEventCatalogItem,
  type SmsPatternRegistryRow,
  type SmsRecoveryEventConfig,
  type SmsShortcode,
  type SmsTemplateRow,
} from '@/lib/modirpayamak-api'

type VarRow = { name: string; type: 'string' | 'integer' }

type IppanelPattern = {
  id?: string
  title?: string
  pattern_code?: string
  pattern_message?: string
  pattern_description?: string
  pattern_status?: string
  pattern_status_fa?: string
  website?: string
  type?: string
  variable?: Array<{ name?: string; type?: string; len?: number }> | null
}

const ORDER_CUSTOMER = 'order_customer'
const ORDER_ADMIN = 'order_admin'

function extractPatterns(raw: unknown): IppanelPattern[] {
  if (Array.isArray(raw)) return raw as IppanelPattern[]
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data as IppanelPattern[]
  if (Array.isArray(obj.patterns)) return obj.patterns as IppanelPattern[]
  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>
    if (Array.isArray(nested.data)) return nested.data as IppanelPattern[]
    if (Array.isArray(nested.patterns)) return nested.patterns as IppanelPattern[]
    if (Array.isArray(nested.items)) return nested.items as IppanelPattern[]
  }
  if (Array.isArray(obj.items)) return obj.items as IppanelPattern[]
  return []
}

function varsFromPattern(p: IppanelPattern | undefined): string[] {
  if (!p) return []
  const fromVars = (p.variable ?? [])
    .map((v) => (v.name ?? '').replace(/%/g, '').trim())
    .filter(Boolean)
  if (fromVars.length) return [...new Set(fromVars)]
  const found = (p.pattern_message ?? '').match(/%([a-zA-Z0-9_]+)%/g) ?? []
  return [...new Set(found.map((m) => m.slice(1, -1)))]
}

function eventLabel(
  t: (key: string, opts?: Record<string, string>) => string,
  key: string,
  catalog: SmsEventCatalogItem[]
): string {
  const i18nKey = `settings.shopSms.events.${key}`
  const translated = t(i18nKey)
  if (translated !== i18nKey) return translated
  return catalog.find((c) => c.key === key)?.label || key
}

function SyncBadge({ status }: { status?: string }) {
  const { t } = useTranslation()
  if (status === 'synced') return <Badge variant="default">{t('settings.shopSms.patternStatus.synced')}</Badge>
  if (status === 'pending') return <Badge variant="secondary">{t('settings.shopSms.patternStatus.pending')}</Badge>
  if (status === 'failed') return <Badge variant="destructive">{t('settings.shopSms.patternStatus.failed')}</Badge>
  return <Badge variant="outline">{t('settings.shopSms.patternStatus.none')}</Badge>
}

const RECOVERY_EVENT_KEYS = new Set([
  'cart-abandoned',
  'order-abandoned',
  'cancelled',
  'failed',
  'user-welcome',
])

const TRACKING_EVENT_KEYS = new Set(['post', 'courier', 'tipax', 'chapar', 'other'])

function normalizeEventKey(key: string): string {
  return key === 'post-barcode' ? 'post' : key
}

function filterShortcodes(shortcodes: SmsShortcode[], eventKey: string, catalog: SmsEventCatalogItem[]): SmsShortcode[] {
  const kind = catalog.find((c) => c.key === eventKey)?.kind
  const isStock = kind === 'extra' && (eventKey === 'stock-low' || eventKey === 'stock-out')
  const isWelcomeOrCart = eventKey === 'user-welcome' || eventKey === 'cart-abandoned'
  const isRecovery = RECOVERY_EVENT_KEYS.has(eventKey)
  return shortcodes.filter((s) => {
    const scope = (s.scope || 'order').toLowerCase()
    if (scope === 'otp') return false
    if (isStock) return scope === 'stock' || scope === 'all'
    if (scope === 'stock') return false
    if (scope === 'recovery') return isRecovery
    if (isWelcomeOrCart) return scope === 'order' || scope === 'all' || scope === 'site'
    return scope === 'order' || scope === 'all' || scope === 'site'
  })
}

function patternStatusFor(
  registry: SmsPatternRegistryRow[],
  scope: string,
  eventKey: string
): { status: string; code: string } {
  const key = normalizeEventKey(eventKey)
  const row =
    registry.find((r) => r.scope === scope && normalizeEventKey(r.event_key) === key) ??
    (key === 'post'
      ? registry.find((r) => r.scope === scope && r.event_key === 'post-barcode')
      : undefined)
  return { status: row?.sync_status ?? 'none', code: (row?.ippanel_code ?? '').trim() }
}

type RoleCellProps = {
  eventKey: string
  role: 'customer' | 'admin'
  enabled: boolean
  body: string
  patternCode: string
  paramMap: Record<string, string>
  syncStatus: string
  shortcodes: SmsShortcode[]
  busy: boolean
  onToggle: (v: boolean) => void
  onBody: (v: string) => void
  onCode: (v: string) => void
  onParamMap: (map: Record<string, string>) => void
  onSave: () => void
  onBind: () => void
  onDetach: () => void
  onRegister: () => void
  onTest: () => void
}

function formatPcodePreview(code: string, map: Record<string, string>): string {
  const lines = [`pcode:${code.trim()}`]
  Object.entries(map).forEach(([k, v]) => {
    if (k.trim()) lines.push(`${k}:${v}`)
  })
  return lines.join('\n')
}

function RoleCell({
  role,
  enabled,
  body,
  patternCode,
  paramMap,
  syncStatus,
  shortcodes,
  busy,
  onToggle,
  onBody,
  onCode,
  onParamMap,
  onSave,
  onBind,
  onDetach,
  onRegister,
  onTest,
}: RoleCellProps) {
  const { t } = useTranslation()
  const [patternMessage, setPatternMessage] = useState('')
  const [patternVars, setPatternVars] = useState<string[]>([])
  const [loadingPattern, setLoadingPattern] = useState(false)

  const loadPattern = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) {
      setPatternMessage('')
      setPatternVars([])
      return
    }
    setLoadingPattern(true)
    try {
      const res = await fetchSmsPattern(trimmed)
      const data = (res.data ?? {}) as IppanelPattern
      const msg = String(data.pattern_message ?? '')
      setPatternMessage(msg)
      const vars = varsFromPattern(data)
      setPatternVars(vars)
      const nextMap = { ...paramMap }
      vars.forEach((v) => {
        if (!nextMap[v]) nextMap[v] = `{${v}}`
      })
      onParamMap(nextMap)
      onBody(formatPcodePreview(trimmed, nextMap))
    } catch (e) {
      toastApiError(t, e as Error)
    } finally {
      setLoadingPattern(false)
    }
  }

  const preview = formatPcodePreview(patternCode, paramMap)

  return (
    <div className="bg-background/50 space-y-3 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label className="font-medium">
            {role === 'customer' ? t('marketing.sms.scopeCustomer') : t('marketing.sms.scopeAdmin')}
          </Label>
          <SyncBadge status={syncStatus} />
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} disabled={busy} />
      </div>

      <div className="space-y-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        <p>{t('marketing.sms.patternBindHelp')}</p>
        <p>{t('marketing.sms.patternBindHint')}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">{t('marketing.sms.patternCode')}</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-[12rem] flex-1 font-mono text-sm"
            dir="ltr"
            value={patternCode}
            onChange={(e) => onCode(e.target.value)}
            disabled={busy}
            placeholder={t('settings.shopSms.patternCodePlaceholder')}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy || loadingPattern || !patternCode.trim()}
            onClick={() => void loadPattern(patternCode)}
          >
            {t('marketing.sms.fetchPattern')}
          </Button>
        </div>
      </div>

      {patternMessage ? (
        <div className="space-y-1">
          <Label className="text-xs">{t('marketing.sms.patternMessage')}</Label>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-xs" dir="auto">
            {patternMessage}
          </pre>
        </div>
      ) : null}

      {patternVars.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-xs">{t('marketing.sms.mapPatternVars')}</Label>
          {patternVars.map((pv) => (
            <div key={pv} className="grid gap-2 sm:grid-cols-[7rem_1fr]">
              <code className="self-center font-mono text-xs" dir="ltr">
                %{pv}%
              </code>
              <Select
                value={paramMap[pv] || undefined}
                onValueChange={(v) => {
                  const next = { ...paramMap, [pv]: v }
                  onParamMap(next)
                  onBody(formatPcodePreview(patternCode, next))
                }}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('marketing.sms.pickSiteVar')} />
                </SelectTrigger>
                <SelectContent>
                  {shortcodes.map((s) => (
                    <SelectItem key={s.key} value={`{${s.key}}`}>
                      {s.label} ({`{${s.key}}`})
                    </SelectItem>
                  ))}
                  <SelectItem value={`{b_first_name} {b_last_name}`}>
                    {t('marketing.sms.compositeFullName')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-1">
        <Label className="text-xs">{t('marketing.sms.paramPreview')}</Label>
        <Textarea rows={4} className="font-mono text-xs" dir="ltr" value={preview || body} readOnly />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={onSave}>
          {t('marketing.sms.matrixSaveCell')}
        </Button>
        <Button type="button" size="sm" disabled={busy || !patternCode.trim()} onClick={onBind}>
          {t('settings.shopSms.bindPattern')}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onRegister}>
          {t('marketing.sms.matrixRegister')}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy || syncStatus === 'none'} onClick={onDetach}>
          {t('marketing.sms.detachPattern')}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onTest}>
          {t('settings.shopSms.testSms')}
        </Button>
      </div>
    </div>
  )
}

export default function SmsPatternsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const patternsQ = useQuery({ queryKey: ['sms-patterns'], queryFn: () => fetchSmsPatterns(1, 100) })
  const registryQ = useQuery({ queryKey: ['sms-pattern-registry'], queryFn: fetchSmsPatternRegistry })
  const shopQ = useQuery({ queryKey: ['shop-sms-settings'], queryFn: fetchShopSmsSettings })
  useQueryErrorToast(patternsQ)
  useQueryErrorToast(registryQ)
  useQueryErrorToast(shopQ)

  const unavailable = isSmsUnavailable(shopQ.data) || isSmsUnavailable(patternsQ.data as { unavailable?: boolean })

  const [settings, setSettings] = useState<ShopSmsSettings | null>(null)
  const [templates, setTemplates] = useState<SmsTemplateRow[]>([])
  const [registry, setRegistry] = useState<SmsPatternRegistryRow[]>([])
  const [testPhone, setTestPhone] = useState('')
  const [filter, setFilter] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [message, setMessage] = useState('')
  const [brandName, setBrandName] = useState('')
  const [isShare, setIsShare] = useState(false)
  const [vars, setVars] = useState<VarRow[]>([])
  const [checkBrand, setCheckBrand] = useState(false)
  const [checkNonPromo, setCheckNonPromo] = useState(false)
  const [checkEnamad, setCheckEnamad] = useState(false)
  const [checkTest, setCheckTest] = useState(false)

  useEffect(() => {
    if (!shopQ.data) return
    if (shopQ.data.settings) setSettings({ ...shopQ.data.settings })
    if (shopQ.data.templates) setTemplates([...shopQ.data.templates])
    if (shopQ.data.registry) setRegistry([...(shopQ.data.registry as SmsPatternRegistryRow[])])
  }, [shopQ.data])

  useEffect(() => {
    if (registryQ.data?.registry) setRegistry([...(registryQ.data.registry as SmsPatternRegistryRow[])])
  }, [registryQ.data])

  const patterns = useMemo(() => extractPatterns(patternsQ.data?.data ?? patternsQ.data), [patternsQ.data])
  const catalog: SmsEventCatalogItem[] = useMemo(() => {
    if (shopQ.data?.event_catalog?.length) return shopQ.data.event_catalog
    return (shopQ.data?.event_keys ?? []).map((key) => ({ key, label: key, kind: 'status' as const }))
  }, [shopQ.data])

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((c) => {
      const label = eventLabel(t, c.key, catalog).toLowerCase()
      return c.key.toLowerCase().includes(q) || label.includes(q)
    })
  }, [catalog, filter, t])

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['shop-sms-settings'] }),
      qc.invalidateQueries({ queryKey: ['sms-pattern-registry'] }),
      qc.invalidateQueries({ queryKey: ['sms-patterns'] }),
    ])
    await shopQ.refetch()
    await registryQ.refetch()
  }

  const getTpl = (scope: string, eventKey: string) =>
    templates.find((x) => x.scope === scope && x.event_key === eventKey)

  const isScopeEnabled = (scope: string, eventKey: string) => {
    const role = scope.includes('admin') ? 'admin' : 'customer'
    return !!settings?.events?.[eventKey]?.[role]
  }

  const updateTpl = (scope: string, eventKey: string, patch: Partial<SmsTemplateRow>) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((x) => x.scope === scope && x.event_key === eventKey)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], ...patch }
        return next
      }
      return [
        ...prev,
        {
          scope,
          event_key: eventKey,
          body: '',
          enabled: isScopeEnabled(scope, eventKey),
          ...patch,
        },
      ]
    })
  }

  const persistSettings = useMutation({
    mutationFn: async (next: NonNullable<typeof settings>) => {
      await saveShopSmsSettings({
        settings: { ...next, require_pattern: true, event_catalog: catalog },
      })
    },
    onSuccess: async () => {
      await invalidateAll()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const setEventToggle = (eventKey: string, role: 'customer' | 'admin', value: boolean) => {
    if (!settings) return
    const events = settings.events ?? {}
    const next = {
      ...settings,
      events: {
        ...events,
        [eventKey]: { ...(events[eventKey] ?? { admin: false, customer: false }), [role]: value },
      },
    }
    setSettings(next)
    const scope = role === 'admin' ? ORDER_ADMIN : ORDER_CUSTOMER
    const tpl = getTpl(scope, eventKey)
    updateTpl(scope, eventKey, { enabled: value })
    void (async () => {
      try {
        await saveShopSmsSettings({
          settings: { ...next, require_pattern: true, event_catalog: catalog },
          templates: [
            {
              scope,
              event_key: eventKey,
              body: tpl?.body ?? '',
              enabled: value,
              pattern_code: (tpl?.pattern_code ?? cellCode(scope, eventKey)) || null,
              param_map: cellParamMap(scope, eventKey),
            },
          ],
        })
        await invalidateAll()
      } catch (e) {
        toastApiError(t, e as Error)
      }
    })()
  }

  const setRecovery = (eventKey: string, patch: Partial<SmsRecoveryEventConfig>) => {
    if (!settings) return
    const recovery = { ...(settings.recovery ?? {}) }
    recovery[eventKey] = { ...(recovery[eventKey] ?? {}), ...patch }
    setSettings({ ...settings, recovery })
  }

  const saveRecovery = useMutation({
    mutationFn: async () => {
      if (!settings) throw new Error('no settings')
      await saveShopSmsSettings({
        settings: { ...settings, require_pattern: true, event_catalog: catalog },
      })
    },
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await invalidateAll()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const cellCode = (scope: string, eventKey: string) => {
    const key = normalizeEventKey(eventKey)
    const fromTpl = (getTpl(scope, key)?.pattern_code ?? '').trim()
    if (fromTpl) return fromTpl
    return patternStatusFor(registry, scope, key).code
  }

  const cellParamMap = (scope: string, eventKey: string): Record<string, string> => {
    const key = normalizeEventKey(eventKey)
    const fromTpl = getTpl(scope, key)?.param_map
    if (fromTpl && typeof fromTpl === 'object') return { ...fromTpl }
    const fromReg = registry.find((r) => r.scope === scope && normalizeEventKey(r.event_key) === key)?.param_map
    if (fromReg && typeof fromReg === 'object') return { ...fromReg }
    return {}
  }

  const saveCell = useMutation({
    mutationFn: async (opts: { scope: string; eventKey: string }) => {
      if (!settings) throw new Error('no settings')
      const tpl = getTpl(opts.scope, opts.eventKey)
      const code = cellCode(opts.scope, opts.eventKey)
      const param_map = cellParamMap(opts.scope, opts.eventKey)
      const row: SmsTemplateRow = {
        scope: opts.scope,
        event_key: opts.eventKey,
        body: tpl?.body ?? '',
        enabled: isScopeEnabled(opts.scope, opts.eventKey),
        pattern_code: code || null,
        param_map,
      }
      await saveShopSmsSettings({
        settings: { ...settings, require_pattern: true, event_catalog: catalog },
        templates: [row],
      })
      await saveSmsTemplates([row])
    },
    onSuccess: async () => {
      toast.success(t('common.saved'))
      await invalidateAll()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const bindCell = useMutation({
    mutationFn: async (opts: { scope: string; eventKey: string }) => {
      const code = cellCode(opts.scope, opts.eventKey)
      if (!code) throw new Error(t('marketing.sms.patternCodeRequired'))
      const tpl = getTpl(opts.scope, opts.eventKey)
      const param_map = cellParamMap(opts.scope, opts.eventKey)
      const body =
        tpl?.body?.trim() ||
        (Object.keys(param_map).length
          ? [`pcode:${code}`, ...Object.entries(param_map).map(([k, v]) => `${k}:${v}`)].join('\n')
          : '{order_number}')
      await saveSmsTemplates([
        {
          scope: opts.scope,
          event_key: opts.eventKey,
          body,
          enabled: isScopeEnabled(opts.scope, opts.eventKey),
          pattern_code: code,
          param_map,
        },
      ])
      return syncSmsPattern({
        scope: opts.scope,
        event_key: opts.eventKey,
        pattern_code: code,
        bind_only: true,
        param_map,
      })
    },
    onSuccess: async (_data, vars) => {
      toast.success(t('settings.shopSms.patternSynced'))
      const code = cellCode(vars.scope, vars.eventKey)
      const param_map = cellParamMap(vars.scope, vars.eventKey)
      setRegistry((prev) => {
        const rest = prev.filter((r) => !(r.scope === vars.scope && r.event_key === vars.eventKey))
        return [
          ...rest,
          {
            scope: vars.scope,
            event_key: vars.eventKey,
            ippanel_code: code,
            sync_status: 'synced',
            param_map,
          },
        ]
      })
      await invalidateAll()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const registerCell = useMutation({
    mutationFn: async (opts: { scope: string; eventKey: string }) => {
      const tpl = getTpl(opts.scope, opts.eventKey)
      const body = (tpl?.body ?? '').trim()
      if (!body) throw new Error(t('marketing.sms.messageRequired'))
      const param_map = cellParamMap(opts.scope, opts.eventKey)
      const row: SmsTemplateRow = {
        scope: opts.scope,
        event_key: opts.eventKey,
        body,
        enabled: isScopeEnabled(opts.scope, opts.eventKey),
        pattern_code: cellCode(opts.scope, opts.eventKey) || null,
        param_map,
      }
      await saveSmsTemplates([row])
      if (settings) {
        await saveShopSmsSettings({
          settings: { ...settings, require_pattern: true, event_catalog: catalog },
          templates: [row],
        })
      }
      return syncSmsPattern({
        scope: opts.scope,
        event_key: opts.eventKey,
        param_map,
      })
    },
    onSuccess: async (res, vars) => {
      toast.success(t('settings.shopSms.patternSynced'))
      if (res.ippanel_code) {
        updateTpl(vars.scope, vars.eventKey, {
          pattern_code: res.ippanel_code,
          param_map: res.param_map ?? cellParamMap(vars.scope, vars.eventKey),
        })
      }
      await invalidateAll()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const detachCell = useMutation({
    mutationFn: async (opts: { scope: string; eventKey: string }) => {
      await detachSmsPattern({ scope: opts.scope, event_key: opts.eventKey })
      updateTpl(opts.scope, opts.eventKey, { pattern_code: '', param_map: {} })
    },
    onSuccess: async (_data, vars) => {
      toast.success(t('marketing.sms.patternDetached'))
      setRegistry((prev) => prev.filter((r) => !(r.scope === vars.scope && r.event_key === vars.eventKey)))
      await invalidateAll()
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const testCell = useMutation({
    mutationFn: (opts: { eventKey: string; role: 'customer' | 'admin' }) =>
      testOrderSmsNotify({
        event_key: opts.eventKey,
        role: opts.role,
        phone: testPhone.trim() || undefined,
      }),
    onSuccess: () => toast.success(t('settings.shopSms.testSent')),
    onError: (e: Error) => toastApiError(t, e),
  })

  const createMut = useMutation({
    mutationFn: createSmsPattern,
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(t('common.saved'))
        setCreateOpen(false)
        void qc.invalidateQueries({ queryKey: ['sms-patterns'] })
      } else {
        toast.error(res.message || t('marketing.sms.sendFailed'))
      }
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const busy =
    saveCell.isPending ||
    bindCell.isPending ||
    registerCell.isPending ||
    detachCell.isPending ||
    testCell.isPending ||
    createMut.isPending

  const rules = useMemo(
    () => [
      t('marketing.sms.patternRule1'),
      t('marketing.sms.patternRule2'),
      t('marketing.sms.patternRule3'),
      t('marketing.sms.patternRule4'),
      t('marketing.sms.patternRule5'),
      t('marketing.sms.patternRule6'),
    ],
    [t]
  )

  const submitCreate = () => {
    if (!title.trim() || !description.trim() || !message.trim()) {
      toast.error(t('marketing.sms.patternRequiredFields'))
      return
    }
    if (website.trim() && !/^https:\/\//i.test(website.trim())) {
      toast.error(t('marketing.sms.patternWebsiteHttps'))
      return
    }
    if (brandName.trim() && !message.includes(brandName.trim())) {
      toast.error(t('marketing.sms.patternBrandMissing'))
      return
    }
    if (!checkBrand || !checkNonPromo) {
      toast.error(t('marketing.sms.patternChecklistRequired'))
      return
    }
    createMut.mutate({
      title: title.trim(),
      description: description.trim(),
      website: website.trim() || undefined,
      message: message.trim(),
      is_share: isShare,
      variable: vars.filter((v) => v.name.trim()).map((v) => ({ name: v.name.trim(), type: v.type })),
    })
  }

  if (shopQ.isPending && !settings) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('marketing.sms.patternsTitle')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.matrixHint')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/settings/shop/sms">{t('marketing.sms.openShopSms')}</Link>
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="me-1 h-4 w-4" />
            {t('marketing.sms.addPattern')}
          </Button>
        </div>
      </div>

      {unavailable ? (
        <SmsServiceBanner
          message={(shopQ.data as { message?: string } | undefined)?.message}
          onRetry={() => {
            void shopQ.refetch()
            void patternsQ.refetch()
          }}
        />
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('marketing.sms.matrixTestPhone')}</CardTitle>
          <CardDescription>{t('marketing.sms.matrixTestPhoneHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            className="max-w-xs font-mono"
            dir="ltr"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="09xxxxxxxxx"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('marketing.sms.matrixSearchEvent')}
        />
        <p className="text-muted-foreground text-xs">
          {t('marketing.sms.matrixEventCount', { count: filteredCatalog.length })}
        </p>
      </div>

      <div className="space-y-3">
        {filteredCatalog.map((ev) => {
          const customer = patternStatusFor(registry, ORDER_CUSTOMER, ev.key)
          const admin = patternStatusFor(registry, ORDER_ADMIN, ev.key)
          const events = settings?.events ?? {}
          const shortcodes = filterShortcodes(shopQ.data?.shortcodes ?? [], ev.key, catalog)

          return (
            <Card key={ev.key}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{eventLabel(t, ev.key, catalog)}</CardTitle>
                    <CardDescription className="mt-1 font-mono text-xs" dir="ltr">
                      {ev.key}
                      {ev.kind === 'extra' ? ` · ${t('marketing.sms.matrixExtra')}` : ''}
                    </CardDescription>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                    <span>
                      {t('marketing.sms.scopeCustomer')}:{' '}
                      <span className="font-mono" dir="ltr">
                        {customer.code || '—'}
                      </span>
                    </span>
                    <span>
                      {t('marketing.sms.scopeAdmin')}:{' '}
                      <span className="font-mono" dir="ltr">
                        {admin.code || '—'}
                      </span>
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-2">
                {(['customer', 'admin'] as const).map((role) => {
                  const scope = role === 'customer' ? ORDER_CUSTOMER : ORDER_ADMIN
                  const pat = patternStatusFor(registry, scope, ev.key)
                  const tpl = getTpl(scope, ev.key)
                  return (
                    <RoleCell
                      key={role}
                      eventKey={ev.key}
                      role={role}
                      enabled={!!events[ev.key]?.[role]}
                      body={tpl?.body ?? ''}
                      patternCode={cellCode(scope, ev.key)}
                      paramMap={cellParamMap(scope, ev.key)}
                      syncStatus={pat.status}
                      shortcodes={shortcodes}
                      busy={busy || unavailable}
                      onToggle={(v) => setEventToggle(ev.key, role, v)}
                      onBody={(v) => updateTpl(scope, ev.key, { body: v })}
                      onCode={(v) => updateTpl(scope, ev.key, { pattern_code: v })}
                      onParamMap={(map) => updateTpl(scope, ev.key, { param_map: map })}
                      onSave={() => saveCell.mutate({ scope, eventKey: ev.key })}
                      onBind={() => bindCell.mutate({ scope, eventKey: ev.key })}
                      onDetach={() => detachCell.mutate({ scope, eventKey: ev.key })}
                      onRegister={() => registerCell.mutate({ scope, eventKey: ev.key })}
                      onTest={() => testCell.mutate({ eventKey: ev.key, role })}
                    />
                  )
                })}
                {ev.key === 'post' ? (
                  <p className="text-muted-foreground text-xs lg:col-span-2">{t('settings.shopSms.postBarcodeMergedHint')}</p>
                ) : null}
                {TRACKING_EVENT_KEYS.has(ev.key) ? (
                  <p className="text-muted-foreground text-xs lg:col-span-2">{t('settings.shopSms.trackingVarsHint')}</p>
                ) : null}
                {RECOVERY_EVENT_KEYS.has(ev.key) ? (
                  <div className="bg-muted/30 space-y-3 rounded-md border border-border p-3 lg:col-span-2">
                    <p className="text-sm font-medium">{t('settings.shopSms.recoveryTitle')}</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {ev.key === 'cart-abandoned' || ev.key === 'order-abandoned' ? (
                        <div>
                          <Label htmlFor={`rec-delay-${ev.key}`}>{t('settings.shopSms.recoveryDelay')}</Label>
                          <Input
                            id={`rec-delay-${ev.key}`}
                            type="number"
                            min={1}
                            max={720}
                            className="mt-1"
                            value={String(settings?.recovery?.[ev.key]?.delay_hours ?? 24)}
                            onChange={(e) => setRecovery(ev.key, { delay_hours: Number(e.target.value) || 24 })}
                          />
                        </div>
                      ) : null}
                      <div className="flex items-end gap-2 pb-1">
                        <Switch
                          id={`rec-en-${ev.key}`}
                          checked={!!settings?.recovery?.[ev.key]?.enabled}
                          onCheckedChange={(v) => setRecovery(ev.key, { enabled: v === true })}
                        />
                        <Label htmlFor={`rec-en-${ev.key}`} className="cursor-pointer font-normal">
                          {t('settings.shopSms.recoveryCoupon')}
                        </Label>
                      </div>
                      <div>
                        <Label>{t('settings.shopSms.recoveryCouponType')}</Label>
                        <Select
                          value={String(settings?.recovery?.[ev.key]?.type ?? 'percent')}
                          onValueChange={(v) => setRecovery(ev.key, { type: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">{t('settings.shopSms.recoveryPercent')}</SelectItem>
                            <SelectItem value="fixed_cart">{t('settings.shopSms.recoveryFixed')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`rec-amt-${ev.key}`}>{t('settings.shopSms.recoveryAmount')}</Label>
                        <Input
                          id={`rec-amt-${ev.key}`}
                          type="number"
                          min={0}
                          className="mt-1"
                          value={String(settings?.recovery?.[ev.key]?.amount ?? 10)}
                          onChange={(e) => setRecovery(ev.key, { amount: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`rec-exp-${ev.key}`}>{t('settings.shopSms.recoveryExpires')}</Label>
                        <Input
                          id={`rec-exp-${ev.key}`}
                          type="number"
                          min={1}
                          max={365}
                          className="mt-1"
                          value={String(settings?.recovery?.[ev.key]?.expires_days ?? 7)}
                          onChange={(e) => setRecovery(ev.key, { expires_days: Number(e.target.value) || 7 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`rec-use-${ev.key}`}>{t('settings.shopSms.recoveryUsage')}</Label>
                        <Input
                          id={`rec-use-${ev.key}`}
                          type="number"
                          min={1}
                          max={100}
                          className="mt-1"
                          value={String(settings?.recovery?.[ev.key]?.usage_limit ?? 1)}
                          onChange={(e) => setRecovery(ev.key, { usage_limit: Number(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={saveRecovery.isPending || unavailable}
                      onClick={() => void saveRecovery.mutateAsync()}
                    >
                      {t('common.save')}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
        {filteredCatalog.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('common.empty')}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketing.sms.matrixApprovedList')}</CardTitle>
          <CardDescription>{t('marketing.sms.matrixApprovedHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('marketing.sms.patternCode')}</TableHead>
                  <TableHead>{t('marketing.sms.message')}</TableHead>
                  <TableHead>{t('marketing.sms.matrixPatternVars')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patternsQ.isPending
                  ? Array.from({ length: 3 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={3}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : patterns.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground text-sm">
                            {t('marketing.sms.noPatterns')}
                          </TableCell>
                        </TableRow>
                      )
                    : patterns.slice(0, 40).map((p, i) => {
                        const code = (p.pattern_code ?? '').trim()
                        const v = varsFromPattern(p)
                        return (
                          <TableRow key={code || i}>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {code || '—'}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-xs" dir="auto">
                              {p.title || p.pattern_message || '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs" dir="ltr">
                              {v.length ? v.map((x) => `%${x}%`).join(', ') : '—'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
              </TableBody>
            </Table>
          </ScrollTable>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('marketing.sms.addPattern')}</DialogTitle>
          </DialogHeader>
          <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
            <CollapsibleTrigger className="text-muted-foreground flex items-center gap-1 text-sm">
              <ChevronDown className="h-4 w-4" />
              {t('marketing.sms.patternRulesTitle')}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 list-disc space-y-1 pe-4 text-xs">
                {rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <div className="space-y-3 pt-2">
            <div>
              <Label>{t('marketing.sms.patternTitle')}</Label>
              <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>{t('marketing.sms.patternDescription')}</Label>
              <Textarea className="mt-1" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>{t('marketing.sms.patternWebsite')}</Label>
              <Input className="mt-1" dir="ltr" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div>
              <Label>{t('marketing.sms.brandName')}</Label>
              <Input className="mt-1" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            </div>
            <div>
              <Label>{t('marketing.sms.message')}</Label>
              <Textarea className="mt-1" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('marketing.sms.patternVariables')}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setVars((v) => [...v, { name: '', type: 'string' }])}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {vars.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    className="font-mono"
                    dir="ltr"
                    placeholder="order_id"
                    value={row.name}
                    onChange={(e) =>
                      setVars((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                  />
                  <Select
                    value={row.type}
                    onValueChange={(v) =>
                      setVars((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, type: v as 'string' | 'integer' } : x))
                      )
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">string</SelectItem>
                      <SelectItem value="integer">integer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setVars((v) => v.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={checkBrand} onCheckedChange={(v) => setCheckBrand(!!v)} />
                {t('marketing.sms.checkBrandInMessage')}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={checkNonPromo} onCheckedChange={(v) => setCheckNonPromo(!!v)} />
                {t('marketing.sms.checkNonPromotional')}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={checkEnamad} onCheckedChange={(v) => setCheckEnamad(!!v)} />
                {t('marketing.sms.checkEnamad')}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={checkTest} onCheckedChange={(v) => setCheckTest(!!v)} />
                {t('marketing.sms.checkTestWord')}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={isShare} onCheckedChange={(v) => setIsShare(!!v)} />
                {t('marketing.sms.patternIsShare')}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" disabled={createMut.isPending} onClick={submitCreate}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
