import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { SmsMoney } from '@/components/currency/SmsMoney'
import { DateTimePicker } from '@/components/DateTimePicker'
import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
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
import { Textarea } from '@/components/ui/textarea'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import {
  calculateSmsPrice,
  fetchSmsNumbers,
  fetchSmsPattern,
  fetchSmsPatterns,
  sendSms,
  sendSmsP2p,
  type SmsAttachedNumber,
} from '@/lib/modirpayamak-api'
import { normalizeSmsLines, patternDetail, type SmsPatternVariable } from '@/lib/sms-report'
import { toastApiError } from '@/lib/apiError'

type SendMode = 'webservice' | 'pattern' | 'p2p'
type MessageKind = 'transactional' | 'marketing'

type IppanelPattern = {
  title?: string
  pattern_code?: string
  pattern_message?: string
  variable?: Array<{ name?: string; type?: string }> | null
}

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

function varsFromPattern(p: IppanelPattern | undefined): SmsPatternVariable[] {
  if (!p) return []
  return patternDetail(p).variables
}

function normalizeIranPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (/^09\d{9}$/.test(digits)) return digits
  if (/^989\d{9}$/.test(digits)) return `0${digits.slice(2)}`
  if (/^9\d{9}$/.test(digits)) return `0${digits}`
  return null
}

function lineRoleLabel(t: (key: string) => string, role: string): string {
  if (role === 'service') return t('marketing.sms.roleService')
  if (role === 'personal' || role === 'marketing') return t('marketing.sms.rolePersonal')
  return role
}

export default function SmsSendPage() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [kind, setKind] = useState<MessageKind>('marketing')
  const [mode, setMode] = useState<SendMode>('webservice')
  const [phone, setPhone] = useState('')
  const [phones, setPhones] = useState('')
  const [message, setMessage] = useState('')
  const [from, setFrom] = useState('')
  const [patternCode, setPatternCode] = useState('')
  const [fetchedPattern, setFetchedPattern] = useState<IppanelPattern | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [sendTime, setSendTime] = useState<number | null>(null)
  const [priceHint, setPriceHint] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const numbersQ = useQuery({ queryKey: ['sms-numbers'], queryFn: fetchSmsNumbers })
  const patternsQ = useQuery({ queryKey: ['sms-patterns-send'], queryFn: () => fetchSmsPatterns(1, 100) })
  useQueryErrorToast(numbersQ)
  useQueryErrorToast(patternsQ)

  const unavailable = isSmsUnavailable(numbersQ.data)
  const numbers = useMemo(() => normalizeSmsLines(numbersQ.data) as SmsAttachedNumber[], [numbersQ.data])
  const patterns = useMemo(() => extractPatterns(patternsQ.data?.data ?? patternsQ.data), [patternsQ.data])
  const selectedPattern = useMemo(() => {
    const fromList = patterns.find((p) => (p.pattern_code ?? '').trim() === patternCode.trim())
    if (fetchedPattern && (fetchedPattern.pattern_code ?? '').trim() === patternCode.trim()) {
      return { ...fromList, ...fetchedPattern }
    }
    return fromList
  }, [patterns, patternCode, fetchedPattern])
  const patternVars = useMemo(() => varsFromPattern(selectedPattern), [selectedPattern])

  const serviceLine = numbers.find((n) => n.role === 'service')?.number ?? ''
  const personalLine =
    numbers.find((n) => n.role === 'personal')?.number ??
    numbers.find((n) => n.role === 'marketing')?.number ??
    ''

  useEffect(() => {
    if (kind === 'transactional') {
      setMode('pattern')
      if (serviceLine) setFrom(serviceLine)
    } else {
      setMode('webservice')
      if (personalLine) setFrom(personalLine)
    }
  }, [kind, serviceLine, personalLine])

  useEffect(() => {
    const st = location.state as { message?: string; phone?: string; draftTitle?: string } | null
    if (st?.message) setMessage(st.message)
    if (st?.phone) setPhone(st.phone)
  }, [location.state])

  useEffect(() => {
    const code = patternCode.trim()
    if (!code) {
      setFetchedPattern(null)
      return
    }
    let cancelled = false
    void fetchSmsPattern(code)
      .then((res) => {
        if (cancelled) return
        const detail = patternDetail(res.data ?? res)
        setFetchedPattern({
          pattern_code: code,
          pattern_message: detail.message,
          variable: detail.variables,
        })
      })
      .catch(() => {
        if (!cancelled) setFetchedPattern(null)
      })
    return () => {
      cancelled = true
    }
  }, [patternCode])

  useEffect(() => {
    setParamValues((prev) => {
      const next: Record<string, string> = {}
      for (const variable of patternVars) next[variable.name] = prev[variable.name] ?? ''
      return next
    })
  }, [patternVars])

  const estimate = async () => {
    try {
      const recipients =
        mode === 'p2p'
          ? phones.split(/[\n,;]+/).map((p) => p.trim()).filter(Boolean)
          : [phone].map((p) => p.trim()).filter(Boolean)
      const res = await calculateSmsPrice({
        sending_type: mode === 'pattern' ? 'pattern' : mode === 'p2p' ? 'peer_to_peer' : 'webservice',
        from_number: from || undefined,
        message: message || '',
        recipients,
        recipient_count: Math.max(1, recipients.length),
        params:
          mode === 'pattern'
            ? { code: patternCode, values: paramValues }
            : mode === 'p2p'
              ? { groups: [{ message, recipients }] }
              : { message },
      })
      if (res.customer_cost != null) {
        setPriceHint(Number(res.customer_cost))
      }
    } catch {
      setPriceHint('')
    }
  }

  const submit = async () => {
    if (mode === 'p2p') {
      const list = phones
        .split(/[\n,;]+/)
        .map((p) => normalizeIranPhone(p.trim()))
        .filter((p): p is string => !!p)
      if (!list.length) {
        toast.error(t('marketing.sms.invalidPhone'))
        return
      }
      setLoading(true)
      try {
        const res = await sendSmsP2p({
          sending_type: 'peer_to_peer',
          from_number: from || undefined,
          params: {
            groups: [{ message, recipients: list }],
          },
        })
        if (res.ok) toast.success(t('marketing.sms.sent'))
        else toast.error(t('marketing.sms.sendFailed'))
      } catch (e) {
        toastApiError(t, e as Error)
      }
      setLoading(false)
      return
    }

    const normalized = normalizeIranPhone(phone)
    if (!normalized) {
      toast.error(t('marketing.sms.invalidPhone'))
      return
    }

    setLoading(true)
    try {
      if (mode === 'pattern') {
        if (!patternCode.trim()) {
          toast.error(t('marketing.sms.patternCodeRequired'))
          setLoading(false)
          return
        }
        const params: Record<string, string> = {}
        for (const variable of patternVars) params[variable.name] = paramValues[variable.name] ?? ''
        const res = await sendSms({
          sending_type: 'pattern',
          from_number: from || serviceLine || undefined,
          code: patternCode.trim(),
          recipients: [normalized],
          params,
          send_time: sendTime ?? undefined,
        })
        if (res.ok) toast.success(t('marketing.sms.sent'))
        else toast.error((res as { message?: string }).message || t('marketing.sms.sendFailed'))
      } else {
        if (!message.trim()) {
          toast.error(t('marketing.sms.messageRequired'))
          setLoading(false)
          return
        }
        const res = await sendSms({
          phone: normalized,
          message,
          from_number: from || personalLine || undefined,
          send_time: sendTime ?? undefined,
        })
        if (res.ok) toast.success(t('marketing.sms.sent'))
        else toast.error(t('marketing.sms.sendFailed'))
      }
    } catch (e) {
      toastApiError(t, e as Error)
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('marketing.sms.sendTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.sendHint')}</p>
      </div>
      {unavailable ? (
        <SmsServiceBanner message={numbersQ.data?.message} onRetry={() => void numbersQ.refetch()} />
      ) : null}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t('marketing.sms.sendTitle')}</CardTitle>
          <CardDescription>{t('marketing.sms.lineHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset disabled={unavailable} className="space-y-4">
            <div>
              <Label>{t('marketing.sms.messageKind')}</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as MessageKind)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactional">{t('marketing.sms.kindTransactional')}</SelectItem>
                  <SelectItem value="marketing">{t('marketing.sms.kindMarketing')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('marketing.sms.sendMode')}</Label>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as SendMode)}
                disabled={kind === 'transactional'}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webservice">{t('marketing.sms.modeWebservice')}</SelectItem>
                  <SelectItem value="pattern">{t('marketing.sms.modePattern')}</SelectItem>
                  <SelectItem value="p2p">{t('marketing.sms.modeP2p')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('marketing.sms.fromNumber')}</Label>
              {numbers.length > 0 ? (
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('marketing.sms.fromNumber')} />
                  </SelectTrigger>
                  <SelectContent>
                    {numbers.map((n) => (
                      <SelectItem key={`${n.role}-${n.number}`} value={n.number}>
                        {n.label ? `${n.label} — ` : ''}
                        {n.number} ({lineRoleLabel(t, n.role)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="mt-1"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="+983000505"
                  dir="ltr"
                />
              )}
            </div>
            {mode === 'p2p' ? (
              <div>
                <Label>{t('marketing.sms.phonesList')}</Label>
                <Textarea
                  className="mt-1 font-mono text-sm"
                  rows={4}
                  value={phones}
                  onChange={(e) => setPhones(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Label>{t('marketing.sms.phone')}</Label>
                <Input
                  className="mt-1 font-mono"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                />
              </div>
            )}
            {mode === 'pattern' ? (
              <>
                <div>
                  <Label>{t('marketing.sms.patternCode')}</Label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Input
                      className="font-mono"
                      dir="ltr"
                      value={patternCode}
                      onChange={(e) => setPatternCode(e.target.value)}
                    />
                    <Select value={patternCode || undefined} onValueChange={setPatternCode}>
                      <SelectTrigger className="sm:w-56">
                        <SelectValue placeholder={t('marketing.sms.pickPattern')} />
                      </SelectTrigger>
                      <SelectContent>
                        {patterns.map((p) => {
                          const code = (p.pattern_code ?? '').trim()
                          if (!code) return null
                          return (
                            <SelectItem key={code} value={code}>
                              {p.title ? `${p.title} (${code})` : code}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedPattern?.pattern_message ? (
                    <p className="text-muted-foreground mt-2 text-xs" dir="auto">
                      {selectedPattern.pattern_message}
                    </p>
                  ) : null}
                </div>
                {patternVars.length > 0 ? (
                  <div className="space-y-3 rounded-xl border p-3">
                    <Label>{t('marketing.sms.patternParams')}</Label>
                    {patternVars.map((variable) => (
                      <div key={variable.name} className="space-y-1">
                        <Label className="font-mono text-xs" dir="ltr">
                          %{variable.name}%
                          <span className="text-muted-foreground ms-2 font-sans">
                            {variable.type === 'integer' ? t('marketing.sms.varInteger') : t('marketing.sms.varString')}
                          </span>
                        </Label>
                        <Input
                          value={paramValues[variable.name] ?? ''}
                          onChange={(e) => setParamValues((prev) => ({ ...prev, [variable.name]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">{t('marketing.sms.noPatternVars')}</p>
                )}
              </>
            ) : (
              <div>
                <Label>{t('marketing.sms.message')}</Label>
                <Textarea className="mt-1" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            )}
            {priceHint != null ? (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>{t('marketing.sms.estimatePrice')}</span>
                <SmsMoney amount={priceHint} locale={i18n.language} />
              </p>
            ) : null}
            <DateTimePicker
              id="sms-send-time"
              label={t('marketing.sms.sendTime')}
              value={sendTime ?? undefined}
              onChange={setSendTime}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void estimate()}>
                {t('marketing.sms.estimatePrice')}
              </Button>
              <Button type="button" disabled={loading} onClick={() => void submit()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('marketing.sms.send')}
              </Button>
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  )
}
