import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { basalamFaq } from './basalamFaq'

/**
 * Basalam help/FAQ, ported from the retired wp-admin Help page.
 * The 48 upstream questions live in `basalamFaq.ts` (identical content, no markup).
 */
export default function BasalamHelpPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('')

  const categories = useMemo(
    () => Array.from(new Set(basalamFaq.map((item) => item.category))),
    [],
  )

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return basalamFaq.filter((item) => {
      if (category && item.category !== category) return false
      if (!needle) return true
      return (
        item.question.toLowerCase().includes(needle) || item.answer.toLowerCase().includes(needle)
      )
    })
  }, [query, category])

  return (
    <PageShell title={t('basalam.helpTitle')} description={t('basalam.helpSubtitle')}>
      <BasalamNav />

      <div className="max-w-4xl space-y-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('basalam.helpSearch')}
          aria-label={t('basalam.helpSearch')}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={category === '' ? 'default' : 'outline'}
            onClick={() => setCategory('')}
          >
            {t('basalam.helpAll')}
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              {t('basalam.helpEmpty')}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <details key={item.question} className="bg-card rounded-lg border px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium">{item.question}</summary>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-line">
                  {item.answer}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">{item.category}</p>
              </details>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('basalam.helpSupportTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{t('basalam.helpSupportHint')}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <a href="https://webina.dev" target="_blank" rel="noreferrer">
                  {t('basalam.helpSupportLink')}
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="https://wp.hamsalam.ir/help" target="_blank" rel="noreferrer">
                  {t('basalam.helpVideos')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
