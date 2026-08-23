import { ExternalLink, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ProductTitleSectionProps = {
  name: string
  englishName: string
  slug: string
  permalinkBase?: string
  permalink?: string
  onNameChange: (v: string) => void
  onEnglishNameChange: (v: string) => void
  onSlugChange: (v: string) => void
  onSlugTouched: () => void
}

export function ProductTitleSection({
  name,
  englishName,
  slug,
  permalinkBase = '',
  permalink,
  onNameChange,
  onEnglishNameChange,
  onSlugChange,
  onSlugTouched,
}: ProductTitleSectionProps) {
  const { t } = useTranslation()
  const [editingSlug, setEditingSlug] = useState(false)

  const base = permalinkBase || ''
  const liveUrl = slug ? `${base}${slug}/` : base
  const viewUrl = permalink || liveUrl

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.titleSection')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">{t('products.fieldName')}</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t('products.editor.namePlaceholder')}
              className="text-base font-medium sm:text-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-english-name">{t('products.ishop.englishName')}</Label>
            <Input
              id="product-english-name"
              value={englishName}
              onChange={(e) => onEnglishNameChange(e.target.value)}
              placeholder={t('products.ishop.englishNamePlaceholder')}
              dir="ltr"
              className="text-base sm:text-lg"
            />
          </div>
        </div>

        <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/20 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">{t('products.editor.permalink')}</span>
            {!editingSlug ? (
              <>
                <a
                  href={viewUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-full truncate text-sm text-primary underline-offset-2 hover:underline"
                  dir="ltr"
                >
                  {liveUrl || t('products.editor.permalinkEmpty')}
                </a>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setEditingSlug(true)}
                        aria-label={t('products.editor.editPermalink')}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('products.editor.editPermalink')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <div className="flex w-full flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs" dir="ltr">
                  {base}
                </span>
                <Input
                  id="product-slug"
                  value={slug}
                  onChange={(e) => {
                    onSlugTouched()
                    onSlugChange(e.target.value)
                  }}
                  placeholder={t('products.editor.slugPlaceholder')}
                  dir="ltr"
                  className="h-8 max-w-xs font-mono text-sm"
                  autoFocus
                />
                <span className="text-muted-foreground font-mono text-xs">/</span>
                <Button type="button" size="sm" className="h-7" onClick={() => setEditingSlug(false)}>
                  {t('products.editor.okPermalink')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  onClick={() => setEditingSlug(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-xs">{t('products.editor.slugHint')}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductViewButton({ href }: { href?: string }) {
  const { t } = useTranslation()
  if (!href) return null
  return (
    <Button type="button" size="sm" variant="outline" className="gap-1.5" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="size-3.5" />
        {t('products.editor.viewProduct')}
      </a>
    </Button>
  )
}
