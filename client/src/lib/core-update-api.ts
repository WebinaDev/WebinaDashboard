import { apiFetch } from '@/lib/api'

export type CoreUpdateStatus = {
  version: string
  latest_version: string
  update_available: boolean
  release_notes?: string
  package_available?: boolean
  license_active?: boolean
  unavailable?: boolean
}

export type CoreUpdateResult = {
  ok: boolean
  version: string
  previous_version: string
  reload_required: boolean
}

export async function fetchCoreUpdateStatus(refresh = false): Promise<CoreUpdateStatus> {
  const q = refresh ? '?refresh=1' : ''
  return apiFetch<CoreUpdateStatus>(`core/update-status${q}`)
}

export async function runCoreUpdate(version?: string): Promise<CoreUpdateResult> {
  return apiFetch<CoreUpdateResult>('core/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(version ? { version } : {}),
  })
}
