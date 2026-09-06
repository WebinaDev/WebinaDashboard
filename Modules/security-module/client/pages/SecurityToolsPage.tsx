import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SECURITY_TOOLS } from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

export default function SecurityToolsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const visibleTools = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SECURITY_TOOLS
    return SECURITY_TOOLS.filter((tool) => {
      const title = t(`security.tools.${tool}.title`, { defaultValue: tool }).toLowerCase()
      const desc = t(`security.tools.${tool}.desc`, { defaultValue: '' }).toLowerCase()
      return tool.includes(q) || title.includes(q) || desc.includes(q)
    })
  }, [search, t])

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Input
        type="search"
        placeholder={t('security.toolsSearch', { defaultValue: 'Search tools…' })}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {visibleTools.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('security.toolsNoMatch', { defaultValue: 'No tools match your search.' })}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <Link key={tool} to={`/security/tools/${tool}`} className="block">
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t(`security.tools.${tool}.title`, { defaultValue: tool })}</CardTitle>
                  <CardDescription>
                    {t(`security.tools.${tool}.desc`, { defaultValue: t('security.toolDefaultDesc') })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="font-mono text-xs text-muted-foreground">{tool}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
