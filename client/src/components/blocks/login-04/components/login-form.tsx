import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { toast } from 'sonner'

type AuthMode = 'password' | 'otp'
type OtpPurpose = 'login' | 'register'

type OtpSendResponse = {
  ok?: boolean
  channels_sent?: string[]
  masked_destinations?: Record<string, string>
  message?: string
}

function channelLabel(t: (k: string) => string, ch: string): string {
  const map: Record<string, string> = {
    sms: t('login.channel.sms'),
    email: t('login.channel.email'),
    bale: t('login.channel.bale'),
    telegram: t('login.channel.telegram'),
  }
  return map[ch] ?? ch
}

export function LoginForm({
  className,
  ...props
}: ComponentProps<'div'>) {
  const { t } = useTranslation()
  const homeUrl = window.webinoDashboard.homeUrl || '/'
  const siteName = window.webinoDashboard.siteName?.trim() || t('app.title')
  const iconUrl = window.webinoDashboard.siteIconUrl?.trim()
  const otpFlags = window.webinoDashboard.otpAuth
  const otpLoginEnabled = !!otpFlags?.login_enabled
  const otpRegisterEnabled = !!otpFlags?.register_enabled
  const otpAvailable = otpLoginEnabled || otpRegisterEnabled

  const [mode, setMode] = useState<AuthMode>('password')
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>(otpLoginEnabled ? 'login' : 'register')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [channelsSent, setChannelsSent] = useState<string[]>([])
  const [remember, setRemember] = useState(true)
  const [pending, setPending] = useState(false)

  const channelsHint = useMemo(() => {
    if (!channelsSent.length) return ''
    return channelsSent.map((c) => channelLabel(t, c)).join(t('login.channelJoin'))
  }, [channelsSent, t])

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    try {
      await apiFetch<{ success?: boolean }>('auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: identifier.trim(),
          password,
          remember,
          login_nonce: window.webinoDashboard.loginNonce,
        }),
      })
      window.location.assign(window.webinoDashboard.baseUrl)
    } catch (err) {
      toastApiError(t, err)
    } finally {
      setPending(false)
    }
  }

  async function onSendCode() {
    setPending(true)
    try {
      const purpose: OtpPurpose =
        otpPurpose === 'register' && otpRegisterEnabled
          ? 'register'
          : otpLoginEnabled
            ? 'login'
            : 'register'
      const res = await apiFetch<OtpSendResponse>('auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          purpose,
          login_nonce: window.webinoDashboard.loginNonce,
        }),
      })
      setCodeSent(true)
      setChannelsSent(res.channels_sent ?? [])
      toast.success(res.message || t('login.otpSent'))
    } catch (err) {
      toastApiError(t, err)
    } finally {
      setPending(false)
    }
  }

  async function onOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codeSent) {
      await onSendCode()
      return
    }
    setPending(true)
    try {
      const purpose: OtpPurpose =
        otpPurpose === 'register' && otpRegisterEnabled
          ? 'register'
          : otpLoginEnabled
            ? 'login'
            : 'register'
      await apiFetch<{ success?: boolean }>('auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          code: code.trim(),
          purpose,
          remember,
          login_nonce: window.webinoDashboard.loginNonce,
        }),
      })
      window.location.assign(window.webinoDashboard.baseUrl)
    } catch (err) {
      toastApiError(t, err)
    } finally {
      setPending(false)
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next)
    setCode('')
    setCodeSent(false)
    setChannelsSent([])
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="flex flex-col gap-6 p-6 md:p-8"
            onSubmit={(e) => void (mode === 'password' ? onPasswordSubmit(e) : onOtpSubmit(e))}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">
                {mode === 'otp' && otpPurpose === 'register' ? t('login.registerTitle') : t('login.title')}
              </h1>
              <p className="text-balance text-muted-foreground text-sm">
                {mode === 'otp' ? t('login.otpSubtitle') : t('login.subtitle')}
              </p>
            </div>

            {otpAvailable ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'password' ? 'default' : 'outline'}
                  onClick={() => switchMode('password')}
                >
                  {t('login.modePassword')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'otp' ? 'default' : 'outline'}
                  onClick={() => {
                    switchMode('otp')
                    setOtpPurpose(otpLoginEnabled ? 'login' : 'register')
                  }}
                >
                  {t('login.modeOtp')}
                </Button>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="dashboard-login-id">
                {mode === 'otp' ? t('login.otpIdentifier') : t('login.identifier')}
              </Label>
              <Input
                id="dashboard-login-id"
                name="login"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  setCodeSent(false)
                  setChannelsSent([])
                }}
                required
              />
            </div>

            {mode === 'password' ? (
              <div className="grid gap-2">
                <Label htmlFor="dashboard-login-password">{t('login.password')}</Label>
                <Input
                  id="dashboard-login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                {otpLoginEnabled && otpRegisterEnabled ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={otpPurpose === 'login' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        setOtpPurpose('login')
                        setCodeSent(false)
                        setCode('')
                      }}
                    >
                      {t('login.otpLogin')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={otpPurpose === 'register' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        setOtpPurpose('register')
                        setCodeSent(false)
                        setCode('')
                      }}
                    >
                      {t('login.otpRegister')}
                    </Button>
                  </div>
                ) : null}

                {codeSent ? (
                  <div className="grid gap-2">
                    <Label htmlFor="dashboard-login-otp">{t('login.otpCode')}</Label>
                    <Input
                      id="dashboard-login-otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    {channelsHint ? (
                      <p className="text-muted-foreground text-xs">
                        {t('login.otpSentVia', { channels: channelsHint })}
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto justify-start p-0 text-xs"
                      disabled={pending}
                      onClick={() => void onSendCode()}
                    >
                      {t('login.otpResend')}
                    </Button>
                  </div>
                ) : null}
              </>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="dashboard-login-remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="dashboard-login-remember" className="cursor-pointer font-normal">
                {t('login.remember')}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? t('login.pending')
                : mode === 'otp' && !codeSent
                  ? t('login.otpSend')
                  : t('login.submit')}
            </Button>

            {mode === 'password' && otpRegisterEnabled ? (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => {
                  switchMode('otp')
                  setOtpPurpose('register')
                }}
              >
                {t('login.registerWithOtp')}
              </Button>
            ) : null}

            <Button variant="outline" className="w-full" asChild type="button">
              <a href={homeUrl}>{t('login.backHome')}</a>
            </Button>
          </form>
          <div className="relative hidden flex-col justify-between gap-4 bg-muted p-8 md:flex">
            <div>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('login.heroHint')}</p>
              <p className="mt-4 font-semibold">{siteName}</p>
            </div>
            {iconUrl ? (
              <LazyImage src={iconUrl} alt={siteName} className="mx-auto size-24 rounded-lg object-cover shadow-sm" eager />
            ) : (
              <div className="mx-auto flex size-24 items-center justify-center rounded-lg bg-background/80 text-2xl font-semibold shadow-sm">
                {siteName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
