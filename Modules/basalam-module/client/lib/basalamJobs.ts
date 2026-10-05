import type { TFunction } from 'i18next'

import { pickJobTimestamp } from '@/lib/date'

export type BasalamJobLike = {
  id?: number
  job_type?: string
  type?: string
  status?: string
  error_message?: string
  created_at?: string | number
  started_at?: string | number
  completed_at?: string | number
  failed_at?: string | number
  updated_at?: string | number
}

/** Prefer failed/started/created; never use BIGINT zero defaults. */
export function basalamJobTime(job: BasalamJobLike): number | string | undefined {
  return pickJobTimestamp(job.failed_at, job.completed_at, job.started_at, job.created_at, job.updated_at)
}

/** Human-readable job error (JSON attempt map → last message; cancelled → i18n). */
export function basalamJobErrorLabel(raw: string | undefined | null, t: TFunction): string {
  if (!raw || raw === 'null' || raw === 'undefined') return '—'
  const text = String(raw).trim()
  if (!text) return '—'
  if (text === 'cancelled' || text === 'user_cancelled') {
    return t('basalam.jobError.cancelled')
  }
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const values = Object.values(parsed as Record<string, unknown>)
          .map((v) => (typeof v === 'string' ? v : v != null ? String(v) : ''))
          .filter(Boolean)
        if (values.length) return values[values.length - 1] as string
      }
      if (Array.isArray(parsed) && parsed.length) {
        const last = parsed[parsed.length - 1]
        return typeof last === 'string' ? last : String(last)
      }
    } catch {
      /* keep raw */
    }
  }
  return text
}

const JOB_TYPE_KEYS: Record<string, string> = {
  sync_basalam_create_all_products: 'basalam.job.createAllProducts',
  sync_basalam_update_all_products: 'basalam.job.updateAllProducts',
  sync_basalam_bulk_update_products: 'basalam.job.bulkUpdateProducts',
  sync_basalam_create_single_product: 'basalam.job.createProduct',
  sync_basalam_update_single_product: 'basalam.job.updateProduct',
  sync_basalam_auto_connect_products: 'basalam.job.autoConnect',
  sync_basalam_fetch_orders: 'basalam.job.fetchOrders',
  sync_basalam_quick_update: 'basalam.job.quickUpdate',
  webino_basalam_discount_tasks: 'basalam.job.discounts',
}

const STATUS_KEYS: Record<string, string> = {
  pending: 'basalam.jobStatus.pending',
  processing: 'basalam.jobStatus.processing',
  completed: 'basalam.jobStatus.completed',
  failed: 'basalam.jobStatus.failed',
  success: 'basalam.jobStatus.completed',
}

export function basalamJobType(job: BasalamJobLike): string {
  return String(job.job_type || job.type || '')
}

export function basalamJobTypeLabel(raw: string | undefined, t: TFunction): string {
  if (!raw) return '—'
  const key = JOB_TYPE_KEYS[raw]
  if (key) return t(key)
  return t(`basalam.job.${raw}`, {
    defaultValue: raw.replace(/^sync_basalam_/, '').replace(/_/g, ' '),
  })
}

export function basalamJobStatusLabel(raw: string | undefined, t: TFunction): string {
  if (!raw) return '—'
  const key = STATUS_KEYS[raw]
  if (key) return t(key)
  return t(`basalam.jobStatus.${raw}`, { defaultValue: raw })
}
