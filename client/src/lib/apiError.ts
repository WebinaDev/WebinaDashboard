import type { TFunction } from 'i18next'
import { toast } from 'sonner'

import { installStepLabelKey, type InstallPollTimeoutError } from '@/lib/marketplace-api'

export class ApiError extends Error {
  readonly code?: string
  readonly status: number

  constructor(message: string, opts: { code?: string; status: number }) {
    super(message)
    this.name = 'ApiError'
    this.code = opts.code
    this.status = opts.status
  }
}

const CODE_KEYS: Record<string, string> = {
  invalid: 'errors.api.invalid',
  ai_disabled: 'aiContent.errDisabled',
  ai_entity_off: 'aiContent.errEntityOff',
  ai_no_key: 'aiContent.errNoKey',
  ai_job_failed: 'aiContent.generateFailed',
  ai_job: 'aiContent.errJobNotFound',
  forbidden: 'errors.api.forbidden',
  not_found: 'errors.api.notFound',
  invalid_role: 'errors.api.invalidRole',
  forbidden_role: 'errors.api.forbiddenRole',
  invalid_nonce: 'errors.api.invalidNonce',
  timeout: 'errors.api.timeout',
  empty_reply: 'errors.api.emptyReply',
  transport: 'errors.api.transport',
  network_offline: 'errors.api.networkOffline',
  site_updating: 'errors.api.siteUpdating',
  rest_cdn_blocked: 'errors.api.restCdnBlocked',
  crm_unreachable: 'errors.api.crmUnreachable',
  campaigns_disabled: 'bots.campaigns.disabled',
  no_file: 'bots.errors.noFile',
  read_fail: 'bots.errors.readFail',
  invalid_name: 'bots.errors.invalidName',
  media_plan: 'bots.broadcast.mediaPlanHint',
  install_failed: 'marketplace.installFailedGeneric',
  install_timeout: 'marketplace.installTimedOutGeneric',
  install_worker_failed: 'marketplace.installWorkerStuck',
  install_job_start_failed: 'marketplace.installJobStartFailed',
  build_dev_only: 'buildPipeline.devOnly',
}

function messageLooksLikeTimeout(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('curl error 28') ||
    lower.includes('timed out') ||
    lower.includes('did not respond in time') ||
    (lower.includes('زمان') && lower.includes('پاسخ'))
  )
}

function messageLooksLikeEmptyReply(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('curl error 52') ||
    lower.includes('empty reply') ||
    lower.includes('closed the connection without a response') ||
    (lower.includes('پاسخ') && lower.includes('خالی'))
  )
}

const LICENSE_MESSAGE_KEYS: Record<string, string> = {
  'License server is unavailable.': 'license.errors.serverUnavailable',
  'License server temporarily unreachable.': 'license.errors.serverUnreachable',
  'License server did not respond in time. Please try again shortly.': 'license.errors.timeout',
  'License server closed the connection without a response. Please try again shortly.':
    'license.errors.emptyReply',
  'License server hostname could not be resolved.': 'license.errors.hostnameUnresolved',
  'Secure connection to the license server failed.': 'license.errors.secureConnectionFailed',
  'License request exceeded time limit.': 'license.errors.requestTimeLimit',
  'License server rejected the request.': 'license.errors.rejected',
  'No license servers configured.': 'license.errors.noServersConfigured',
  'Invalid response from license server.': 'license.errors.invalidResponse',
  'License server error.': 'license.errors.serverError',
  'Activation request failed.': 'license.errors.activationFailed',
  'CRM request failed.': 'license.errors.crmFailed',
  'License is not active.': 'license.errors.inactive',
  'Dashboard license is inactive or expired.': 'license.errors.inactiveOrExpired',
  'License not confirmed by CRM.': 'license.errors.notConfirmed',
  'Domain mismatch.': 'license.errors.domainMismatch',
  'No license entitlement for this module.': 'license.errors.noEntitlement',
  'Could not save license record.': 'license.errors.couldNotSave',
  'Could not update license record.': 'license.errors.couldNotUpdate',
}

function resolveLicenseMessageKey(message: string): string | undefined {
  const trimmed = message.trim()
  const exact = LICENSE_MESSAGE_KEYS[trimmed]
  if (exact) return exact
  if (trimmed.startsWith('License server returned HTTP')) {
    return 'license.errors.httpStatus'
  }
  if (trimmed.startsWith('License server did not respond within')) {
    return 'license.errors.respondTimeout'
  }
  return undefined
}

function installErrorMessage(t: TFunction, err: InstallPollTimeoutError): string {
  if (err.stuckWorker) {
    return t('marketplace.installWorkerStuck')
  }
  if (err.step && err.code === 'install_timeout') {
    const stepLabel = t(installStepLabelKey(err.step), { defaultValue: err.step })
    return t('marketplace.installTimedOut', { step: stepLabel })
  }
  return t('marketplace.installTimedOutGeneric')
}

export function apiErrorMessage(t: TFunction, err: unknown): string {
  const timeoutErr = err as InstallPollTimeoutError
  if (timeoutErr?.code === 'install_timeout' || (timeoutErr?.step && timeoutErr?.message?.includes('timed out'))) {
    return installErrorMessage(t, timeoutErr)
  }

  if (err instanceof ApiError && err.code) {
    const key = CODE_KEYS[err.code]
    if (key === 'marketplace.installFailedGeneric') {
      const msg = err.message?.trim()
      return msg ? t('marketplace.installFailed', { message: msg }) : t('marketplace.installFailedGeneric')
    }
    if (key) return t(key)
  }
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code: string }).code)
    const key = CODE_KEYS[code]
    if (key) return t(key)
  }
  if (err instanceof Error && err.message) {
    const msg = err.message.trim()
    if (messageLooksLikeTimeout(msg)) {
      return t('errors.api.timeout')
    }
    if (messageLooksLikeEmptyReply(msg)) {
      return t('errors.api.emptyReply')
    }
    if (/^(invalid|forbidden|not found)$/i.test(msg)) {
      return t('errors.api.generic')
    }
    // Prefer the real API/server message over a generic "unknown" toast.
    if (msg && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(msg)) {
      return msg
    }
    return t('errors.api.unknown')
  }
  return t('errors.api.generic')
}

/** User-facing license message from REST snapshot (includes friendly PHP strings). */
export function licenseStatusMessage(
  t: TFunction,
  message: string | undefined,
  errorCode?: string,
): string {
  if (errorCode === 'not_found') return t('license.errors.notFoundDomain')
  if (errorCode === 'timeout') return t('errors.api.timeout')
  if (errorCode === 'empty_reply') return t('errors.api.emptyReply')
  if (errorCode === 'transport') return t('errors.api.transport')
  if (message && message.trim()) {
    if (messageLooksLikeTimeout(message)) return t('errors.api.timeout')
    if (messageLooksLikeEmptyReply(message)) return t('errors.api.emptyReply')
    const key = resolveLicenseMessageKey(message)
    if (key) return t(key)
    return t('errors.api.unknown')
  }
  return t('errors.api.generic')
}

/** Soft notice when REST check failed but last-known good license is shown. */
export function licenseCrmUnreachableMessage(t: TFunction): string {
  return t('errors.api.crmUnreachable')
}

export function toastApiError(t: TFunction, err: unknown): void {
  toast.error(apiErrorMessage(t, err))
}
