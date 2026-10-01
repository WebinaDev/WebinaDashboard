import { apiFetch } from '@/lib/api'

export type MigrateEntityKey =
  | 'categories'
  | 'media'
  | 'products'
  | 'customers'
  | 'orders'
  | 'pages'
  | 'posts'
  | 'menus'

export type MigrateSettings = {
  site_url: string
  token_set: boolean
  token_hint: string
  batch_size: number
  delay_ms: number
  timeout: number
  dry_run: boolean
  entities: Record<string, boolean>
  endpoints: Record<string, string>
  endpoint_defaults: Record<string, string>
  schema: string
  schema_version: number
  entity_labels: Record<string, string>
}

export type MigrateLogRow = {
  ts: string
  level: 'info' | 'warn' | 'error' | string
  message: string
}

export type MigrateJob = {
  id?: string
  status: 'idle' | 'running' | 'paused' | 'failed' | 'completed' | string
  phase?: string
  entities?: string[]
  progress?: Record<string, { exported: number; failed: number; done: boolean }>
  totals?: Record<string, number>
  log?: MigrateLogRow[]
  last_error?: string
  pause_until?: number
  delay_ms?: number
  dry_run?: boolean
  lock_skipped?: boolean
}

export type MigrateSnapshot = {
  settings: MigrateSettings
  job: MigrateJob
  estimates?: Record<string, number>
}

export const MIGRATE_ENTITIES: MigrateEntityKey[] = [
  'categories',
  'media',
  'products',
  'customers',
  'orders',
  'pages',
  'posts',
  'menus',
]

export function fetchMigrateSettings() {
  return apiFetch<MigrateSnapshot>('migrate/settings')
}

export function saveMigrateSettings(body: Record<string, unknown>) {
  return apiFetch<Pick<MigrateSnapshot, 'settings' | 'job'>>('migrate/settings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function testMigrateConnection() {
  return apiFetch<{ ok: boolean; message?: string; http_status?: number }>('migrate/test', {
    method: 'POST',
    body: '{}',
  })
}

export function startMigration(resume: boolean) {
  return apiFetch<{ job: MigrateJob }>('migrate/start', {
    method: 'POST',
    body: JSON.stringify({ resume }),
  })
}

export function tickMigration() {
  return apiFetch<{ job: MigrateJob }>('migrate/tick', { method: 'POST', body: '{}' }, 120_000)
}

export function pauseMigration() {
  return apiFetch<{ job: MigrateJob }>('migrate/pause', { method: 'POST', body: '{}' })
}

export function resetMigration() {
  return apiFetch<{ job: MigrateJob }>('migrate/reset', { method: 'POST', body: '{}' })
}
