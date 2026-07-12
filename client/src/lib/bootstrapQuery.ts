import type { QueryClient } from '@tanstack/react-query'

import type { BootstrapPayload, DashboardModule } from '@/types/modules'

function normalizeModuleNode(raw: DashboardModule & { nav_group?: string }): DashboardModule {
  const { nav_group, children, navGroup, ...rest } = raw
  const node: DashboardModule = {
    ...rest,
    navGroup: navGroup ?? (nav_group as DashboardModule['navGroup']),
    children: children?.map((c) =>
      normalizeModuleNode(c as DashboardModule & { nav_group?: string }),
    ),
  }
  return node
}

function normalizeModules(modules: DashboardModule[] | undefined): DashboardModule[] | undefined {
  if (!modules?.length) {
    return modules
  }
  return modules.map((m) => normalizeModuleNode(m as DashboardModule & { nav_group?: string }))
}

export const BOOTSTRAP_QUERY_KEY = ['bootstrap'] as const

/** Coerce wp_localize_script / REST shapes into a string capability list. */
export function normalizeCapabilities(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter((c): c is string => typeof c === 'string' && c.length > 0)
}

export function normalizeBootstrapPayload(data: BootstrapPayload): BootstrapPayload {
  return {
    ...data,
    capabilities: normalizeCapabilities(data.capabilities),
    modules: normalizeModules(data.modules) ?? data.modules,
    installedModuleSlugs: Array.isArray(data.installedModuleSlugs)
      ? data.installedModuleSlugs.filter((s): s is string => typeof s === 'string' && s.length > 0)
      : data.installedModuleSlugs,
  }
}

export function getBootstrapSnapshot(): BootstrapPayload | undefined {
  const raw = window.webinoDashboard.bootstrap
  if (!raw) {
    return undefined
  }
  return normalizeBootstrapPayload(raw)
}

export function patchBootstrapQuery(
  qc: QueryClient,
  patch: Partial<Pick<BootstrapPayload, 'uiTheme' | 'uiAccent'>>,
) {
  qc.setQueryData<BootstrapPayload>(BOOTSTRAP_QUERY_KEY, (prev) =>
    prev ? { ...prev, ...patch } : prev,
  )
}
