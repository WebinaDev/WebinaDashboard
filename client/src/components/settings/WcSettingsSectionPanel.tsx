import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer, wcValuesToPayload } from '@/components/settings/WcSettingsFormRenderer'
import type { WcSettingsResponse } from '@/components/settings/wc-settings-types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
import { getSsrPage } from '@/lib/ssrPage'
import { cn } from '@/lib/utils'

type WcSettingsSectionPanelProps = {
  page: string
  section?: string
  subsections?: { id: string; labelKey: string }[]
}

export function WcSettingsSectionPanel({ page, section = '', subsections }: WcSettingsSectionPanelProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState(section)
  const [draft, setDraft] = useState<Record<string, unknown>>({})

  const ssrInitial = useMemo(() => {
    const wc = getSsrPage()?.wcSettings as WcSettingsResponse | undefined
    if (!wc || wc.page !== page) return undefined
    if ((wc.section || '') !== (activeSection || '') && activeSection) return undefined
    return wc
  }, [page, activeSection])

  const q = useQuery({
    queryKey: ['wc-settings', page, activeSection],
    queryFn: () => {
      const p = new URLSearchParams()
      if (activeSection) p.set('section', activeSection)
      const qs = p.toString()
      return apiFetch<WcSettingsResponse>(`shop/wc-settings/${page}${qs ? `?${qs}` : ''}`)
    },
    initialData: ssrInitial,
    initialDataUpdatedAt: ssrInitial ? Date.now() : undefined,
    staleTime: 90_000,
    refetchOnMount: ssrInitial ? false : true,
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data?.values) setDraft({ ...q.data.values })
  }, [q.data])

  const save = useMutation({
    mutationFn: () => {
      const p = new URLSearchParams()
      if (activeSection) p.set('section', activeSection)
      const qs = p.toString()
      return apiFetch<WcSettingsResponse>(`shop/wc-settings/${page}${qs ? `?${qs}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wcValuesToPayload(draft)),
      })
    },
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['wc-settings', page] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const tabCls = (id: string) =>
    cn(
      'shrink-0 snap-start rounded-xl px-3 py-1.5 text-sm transition-colors',
      activeSection === id
        ? 'bg-primary/10 font-medium text-primary'
        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
    )

  return (
    <div className="space-y-4">
      {subsections && subsections.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {subsections.map((s) => (
            <button key={s.id} type="button" className={tabCls(s.id)} onClick={() => setActiveSection(s.id)}>
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      ) : null}
      {q.isLoading && !q.data ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : q.data ? (
        <>
          <WcSettingsFormRenderer
            fields={q.data.fields}
            values={draft}
            disabled={save.isPending}
            onChange={(id, value) => setDraft((d) => ({ ...d, [id]: value }))}
          />
          <div className="bg-background/90 sticky bottom-0 z-10 border-t py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()} className="w-full sm:w-auto">
              {t('common.save')}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
