import { apiFetch } from '@/lib/api'

export type BuildPipelineStep = {
  id: string
  label: string
  done: boolean
}

export type BuildPipelineStatus = {
  status: 'idle' | 'running' | 'success' | 'failed'
  current_step: string
  started_at: string | null
  finished_at: string | null
  exit_code: number | null
  error: string
  log_tail?: string
  steps: BuildPipelineStep[]
  locked: boolean
  dev_allowed?: boolean
}

export async function fetchBuildPipelineStatus(): Promise<BuildPipelineStatus> {
  return apiFetch<BuildPipelineStatus>('build-pipeline/status')
}

export async function startBuildPipeline(): Promise<BuildPipelineStatus> {
  return apiFetch<BuildPipelineStatus>('build-pipeline/start', { method: 'POST' })
}

export async function cancelBuildPipeline(): Promise<BuildPipelineStatus> {
  return apiFetch<BuildPipelineStatus>('build-pipeline/cancel', { method: 'POST' })
}
