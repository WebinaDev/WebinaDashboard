import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WcSettingsFormRenderer, wcValuesToPayload } from '@/components/settings/WcSettingsFormRenderer'
import type { WcSettingsResponse } from '@/components/settings/wc-settings-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'
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

  const q = useQuery({
    queryKey: ['wc-settings', page, activeSection],
    queryFn: () => {
      const p = new URLSearchParams()
      if (activeSection) p.set('section', activeSection)
      const qs = p.toString()
      return apiFetch<WcSettingsResponse>(`shop/wc-settings/${page}${qs ? `?${qs}` : ''}`)
    },
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
      'rounded-md px-2 py-1 text-sm',
      activeSection === id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
    )

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 pt-6">
        {subsections && subsections.length > 1 ? (
          <div className="flex flex-wrap gap-1 border-b border-border pb-3">
            {subsections.map((s) => (
              <button key={s.id} type="button" className={tabCls(s.id)} onClick={() => setActiveSection(s.id)}>
                {t(s.labelKey)}
              </button>
            ))}
          </div>
        ) : null}
        {q.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        ) : q.data ? (
          <>
            <WcSettingsFormRenderer
              fields={q.data.fields}
              values={draft}
              disabled={save.isPending}
              onChange={(id, value) => setDraft((d) => ({ ...d, [id]: value }))}
            />
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
              {t('common.save')}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
