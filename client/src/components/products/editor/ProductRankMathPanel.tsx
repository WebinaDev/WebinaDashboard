import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { ProductSeo } from '@/types/product'
import { cn } from '@/lib/utils'

const RM = {
  purple: '#5d2e8e',
  purpleSoft: '#7e54d9',
  green: '#16a34a',
  orange: '#ea580c',
  red: '#dc2626',
}

type SeoCheck = { id: string; ok: boolean; label: string }

type ProductRankMathPanelProps = {
  seo: ProductSeo
  onChange: (next: ProductSeo) => void
  productName: string
  slug: string
  descriptionHtml: string
  shortDescription: string
  permalinkBase?: string
  siteName?: string
  seoSep?: string
  rankMathAvailable?: boolean
  onSlugChange?: (slug: string) => void
  onSlugTouched?: () => void
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function resolveTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/%([a-z0-9_]+)%/gi, (_, key: string) => vars[key.toLowerCase()] ?? '')
}

function scoreColor(score: number) {
  if (score >= 80) return RM.green
  if (score >= 50) return RM.orange
  return RM.red
}

export function ProductRankMathPanel({
  seo,
  onChange,
  productName,
  slug,
  descriptionHtml,
  shortDescription,
  permalinkBase = '',
  siteName = '',
  seoSep = ' - ',
  rankMathAvailable = true,
  onSlugChange,
  onSlugTouched,
}: ProductRankMathPanelProps) {
  const { t } = useTranslation()

  const vars = useMemo(
    () => ({
      title: productName,
      sitename: siteName,
      sep: seoSep,
      excerpt: stripHtml(shortDescription).slice(0, 160),
    }),
    [productName, siteName, seoSep, shortDescription],
  )

  const seoTitleRaw = seo.title?.trim() || '%title% %sep% %sitename%'
  const seoDescRaw = seo.description?.trim() || vars.excerpt
  const resolvedTitle = resolveTemplate(seoTitleRaw, vars)
  const resolvedDesc = resolveTemplate(seoDescRaw, vars)
  const focus = (seo.focus_keyword || '').trim().toLowerCase()
  const contentText = `${productName} ${slug} ${stripHtml(shortDescription)} ${stripHtml(descriptionHtml)}`.toLowerCase()
  const liveUrl = `${permalinkBase}${slug}/`

  const checks: SeoCheck[] = useMemo(() => {
    const hasKw = focus.length > 0
    const inTitle = hasKw && resolvedTitle.toLowerCase().includes(focus)
    const inDesc = hasKw && resolvedDesc.toLowerCase().includes(focus)
    const inSlug = hasKw && slug.toLowerCase().includes(focus.replace(/\s+/g, '-'))
    const inContent = hasKw && contentText.includes(focus)
    const titleLen = resolvedTitle.length
    const descLen = resolvedDesc.length
    return [
      { id: 'kw', ok: hasKw, label: t('products.seo.checkFocusKeyword') },
      { id: 'titleKw', ok: inTitle, label: t('products.seo.checkKeywordInTitle') },
      { id: 'descKw', ok: inDesc, label: t('products.seo.checkKeywordInDesc') },
      { id: 'slugKw', ok: inSlug, label: t('products.seo.checkKeywordInUrl') },
      { id: 'contentKw', ok: inContent, label: t('products.seo.checkKeywordInContent') },
      { id: 'titleLen', ok: titleLen >= 10 && titleLen <= 60, label: t('products.seo.checkTitleLength') },
      { id: 'descLen', ok: descLen >= 70 && descLen <= 160, label: t('products.seo.checkDescLength') },
    ]
  }, [focus, resolvedTitle, resolvedDesc, slug, contentText, t])

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
  const robots = seo.robots ?? []

  function patch(partial: Partial<ProductSeo>) {
    onChange({ ...seo, ...partial })
  }

  function toggleRobot(flag: string, exclusive?: string[]) {
    let next = [...robots]
    if (exclusive) {
      next = next.filter((r) => !exclusive.includes(r))
      next.push(flag)
    } else if (next.includes(flag)) {
      next = next.filter((r) => r !== flag)
    } else {
      next.push(flag)
    }
    patch({ robots: next })
  }

  function insertVar(field: 'title' | 'description', token: string) {
    const cur = (seo[field] || '') + token
    patch({ [field]: cur })
  }

  const varsChips = ['%title%', '%sep%', '%sitename%', '%excerpt%']

  return (
    <Card className="overflow-hidden border-[#5d2e8e]/30 py-0 shadow-sm">
      <CardHeader
        className="flex flex-row items-center justify-between gap-3 px-4 py-3 text-white"
        style={{ background: `linear-gradient(120deg, ${RM.purple} 0%, ${RM.purpleSoft} 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="relative grid size-12 place-items-center rounded-full bg-white/15 text-sm font-bold"
            style={{ boxShadow: `inset 0 0 0 3px ${scoreColor(score)}` }}
          >
            {score}
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              {t('products.seo.panelTitle')}
            </CardTitle>
            <p className="text-xs text-white/80">{t('products.seo.scoreHint', { score })}</p>
          </div>
        </div>
        {!rankMathAvailable ? (
          <span className="rounded-full bg-amber-400/20 px-2 py-1 text-[11px] text-amber-100">
            {t('products.seo.rankMathMissing')}
          </span>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4">
        <div
          className="rounded-lg border border-border bg-[#f8f9fa] p-4 dark:bg-muted/40"
          dir="ltr"
        >
          <p className="truncate text-sm text-[#1a0dab] dark:text-blue-400">{resolvedTitle || '—'}</p>
          <p className="mt-0.5 truncate text-xs text-[#006621] dark:text-emerald-500">{liveUrl}</p>
          <p className="mt-1 line-clamp-2 text-xs text-[#4d5156] dark:text-muted-foreground">
            {resolvedDesc || '—'}
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList variant="line" className="mb-2 w-full justify-start overflow-x-auto">
            <TabsTrigger value="general">{t('products.seo.tabGeneral')}</TabsTrigger>
            <TabsTrigger value="advanced">{t('products.seo.tabAdvanced')}</TabsTrigger>
            <TabsTrigger value="schema">{t('products.seo.tabSchema')}</TabsTrigger>
            <TabsTrigger value="social">{t('products.seo.tabSocial')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label>{t('products.seo.focusKeyword')}</Label>
              <Input
                value={seo.focus_keyword || ''}
                onChange={(e) => patch({ focus_keyword: e.target.value })}
                placeholder={t('products.seo.focusKeywordPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t('products.seo.seoTitle')}</Label>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    resolvedTitle.length > 60 ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {resolvedTitle.length}/60
                </span>
              </div>
              <Input
                value={seo.title || ''}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="%title% %sep% %sitename%"
                dir="auto"
              />
              <div className="flex flex-wrap gap-1">
                {varsChips.map((chip) => (
                  <Button
                    key={chip}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 font-mono text-[10px]"
                    onClick={() => insertVar('title', chip)}
                  >
                    {chip}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t('products.seo.metaDescription')}</Label>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    resolvedDesc.length > 160 ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {resolvedDesc.length}/160
                </span>
              </div>
              <Textarea
                value={seo.description || ''}
                onChange={(e) => patch({ description: e.target.value })}
                rows={3}
                placeholder={t('products.seo.metaDescriptionPlaceholder')}
              />
              <div className="flex flex-wrap gap-1">
                {varsChips.map((chip) => (
                  <Button
                    key={`d-${chip}`}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 font-mono text-[10px]"
                    onClick={() => insertVar('description', chip)}
                  >
                    {chip}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('products.editor.permalink')}</Label>
              <div className="flex flex-wrap items-center gap-2" dir="ltr">
                <span className="text-muted-foreground text-xs">{permalinkBase}</span>
                <Input
                  value={slug}
                  onChange={(e) => {
                    onSlugTouched?.()
                    onSlugChange?.(e.target.value)
                  }}
                  className="h-8 max-w-xs font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{t('products.seo.pillar')}</p>
                <p className="text-muted-foreground text-xs">{t('products.seo.pillarHint')}</p>
              </div>
              <Switch
                checked={Boolean(seo.pillar_content)}
                onCheckedChange={(v) => patch({ pillar_content: v })}
              />
            </div>

            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold" style={{ color: RM.purple }}>
                {t('products.seo.analysis')}
              </p>
              <ul className="space-y-1.5">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-sm">
                    {c.ok ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : focus || c.id === 'titleLen' || c.id === 'descLen' || c.id === 'kw' ? (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-orange-500" />
                    ) : (
                      <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={c.ok ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-3">
              <Label>{t('products.seo.robots')}</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ['index', 'noindex'],
                    ['follow', 'nofollow'],
                  ] as const
                ).map(([a, b]) => (
                  <div key={a} className="flex gap-2 rounded-md border border-border p-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={robots.includes(a) || (!robots.includes(a) && !robots.includes(b)) ? 'default' : 'outline'}
                      className="flex-1"
                      style={
                        robots.includes(a) || (!robots.includes(a) && !robots.includes(b))
                          ? { background: RM.purple }
                          : undefined
                      }
                      onClick={() => toggleRobot(a, [a, b])}
                    >
                      {a}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={robots.includes(b) ? 'default' : 'outline'}
                      className="flex-1"
                      style={robots.includes(b) ? { background: RM.purple } : undefined}
                      onClick={() => toggleRobot(b, [a, b])}
                    >
                      {b}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {(['noarchive', 'noimageindex', 'nosnippet'] as const).map((flag) => (
                  <label key={flag} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={robots.includes(flag)}
                      onCheckedChange={() => toggleRobot(flag)}
                    />
                    {flag}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('products.seo.canonical')}</Label>
              <Input
                value={seo.canonical_url || ''}
                onChange={(e) => patch({ canonical_url: e.target.value })}
                placeholder="https://"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('products.seo.breadcrumb')}</Label>
              <Input
                value={seo.breadcrumb_title || ''}
                onChange={(e) => patch({ breadcrumb_title: e.target.value })}
                placeholder={productName}
              />
            </div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="space-y-2">
              <Label>{t('products.seo.schemaType')}</Label>
              <Input
                value={seo.schema_type || 'product'}
                onChange={(e) => patch({ schema_type: e.target.value })}
                placeholder="product"
                dir="ltr"
              />
              <p className="text-muted-foreground text-xs">{t('products.seo.schemaHint')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['gtin', t('products.seo.gtin')],
                  ['mpn', t('products.seo.mpn')],
                  ['isbn', t('products.seo.isbn')],
                  ['sku_override', t('products.seo.skuOverride')],
                  ['brand', t('products.seo.brand')],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    value={(seo[key] as string) || ''}
                    onChange={(e) => patch({ [key]: e.target.value })}
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-5">
            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">{t('products.seo.facebook')}</p>
              <div className="space-y-2">
                <Label>{t('products.seo.ogTitle')}</Label>
                <Input
                  value={seo.facebook_title || ''}
                  onChange={(e) => patch({ facebook_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.seo.ogDescription')}</Label>
                <Textarea
                  value={seo.facebook_description || ''}
                  onChange={(e) => patch({ facebook_description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.seo.ogImage')}</Label>
                <Input
                  value={seo.facebook_image || ''}
                  onChange={(e) => patch({ facebook_image: e.target.value })}
                  placeholder="https://"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">{t('products.seo.twitter')}</p>
              <div className="space-y-2">
                <Label>{t('products.seo.twitterCard')}</Label>
                <Input
                  value={seo.twitter_card_type || 'summary_large_image'}
                  onChange={(e) => patch({ twitter_card_type: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.seo.ogTitle')}</Label>
                <Input
                  value={seo.twitter_title || ''}
                  onChange={(e) => patch({ twitter_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.seo.ogDescription')}</Label>
                <Textarea
                  value={seo.twitter_description || ''}
                  onChange={(e) => patch({ twitter_description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.seo.ogImage')}</Label>
                <Input
                  value={seo.twitter_image || ''}
                  onChange={(e) => patch({ twitter_image: e.target.value })}
                  placeholder="https://"
                  dir="ltr"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
