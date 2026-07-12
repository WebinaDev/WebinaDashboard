import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { QueryErrorState } from '@/components/QueryErrorState'
import { FormSettingsSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { apiFetch } from '@/lib/api'
import { toastApiError } from '@/lib/apiError'

type SiteGeneral = {
  blogname: string
  blogdescription: string
  admin_email: string
  timezone_string: string
  WPLANG: string
}

export function SiteGeneralSettingsPanel() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [draft, setDraft] = useState<SiteGeneral | null>(null)

  const q = useQuery({
    queryKey: ['site-settings', 'general'],
    queryFn: () => apiFetch<SiteGeneral>('site/settings/general'),
  })
  useQueryErrorToast(q)

  useEffect(() => {
    if (q.data) setDraft({ ...q.data })
  }, [q.data])

  const save = useMutation({
    mutationFn: () =>
      apiFetch('site/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    onSuccess: () => {
      toast.success(t('common.saved'))
      void qc.invalidateQueries({ queryKey: ['site-settings'] })
      void qc.invalidateQueries({ queryKey: ['bootstrap'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  if (!draft && q.isLoading) return <FormSettingsSkeleton cards={1} fieldsPerCard={5} />
  if (q.isError && !draft) return <QueryErrorState onRetry={() => void q.refetch()} />
  if (!draft) return null

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="blogname">{t('settings.site.fieldSiteTitle')}</Label>
          <Input id="blogname" value={draft.blogname} onChange={(e) => setDraft({ ...draft, blogname: e.target.value })} className="max-w-md" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blogdescription">{t('settings.site.fieldTagline')}</Label>
          <Input id="blogdescription" value={draft.blogdescription} onChange={(e) => setDraft({ ...draft, blogdescription: e.target.value })} className="max-w-md" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin_email">{t('settings.site.fieldAdminEmail')}</Label>
          <Input id="admin_email" type="email" value={draft.admin_email} onChange={(e) => setDraft({ ...draft, admin_email: e.target.value })} className="max-w-md" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone_string">{t('settings.site.fieldTimezone')}</Label>
          <Input id="timezone_string" value={draft.timezone_string} onChange={(e) => setDraft({ ...draft, timezone_string: e.target.value })} className="max-w-md" />
        </div>
        <Button type="button" disabled={save.isPending} onClick={() => void save.mutateAsync()}>
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  )
}
