import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/formatNumber'
import { isLightHex } from '@/lib/swatchColor'
import { cn } from '@/lib/utils'
import type { AttributeTerm, AttributeType } from '@/types/attributes'

type AttributeTermsTableProps = {
  terms: AttributeTerm[]
  attributeType: AttributeType
  locale: string
  onEdit: (term: AttributeTerm) => void
  onDelete: (term: AttributeTerm) => void
}

export function AttributeTermsTable({
  terms,
  attributeType,
  locale,
  onEdit,
  onDelete,
}: AttributeTermsTableProps) {
  const { t } = useTranslation()

  if (terms.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">{t('attributes.terms.empty')}</p>
  }

  if (attributeType === 'color' || attributeType === 'image') {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {terms.map((term) => (
          <div
            key={term.id}
            className="group relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center"
          >
            {attributeType === 'color' ? (
              <span
                className={cn(
                  'size-12 rounded-full shadow-inner',
                  isLightHex(term.color) ? 'border border-border' : 'border border-transparent',
                )}
                style={{ backgroundColor: term.color || '#e5e7eb' }}
                title={term.color}
              />
            ) : term.image_url ? (
              <LazyImage src={term.image_url} alt={term.name || t('a11y.thumbnail')} className="size-14 rounded-lg object-cover" />
            ) : (
              <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-lg text-[10px]">
                {t('attributes.terms.noImage')}
              </span>
            )}
            <span className="w-full truncate text-xs font-medium">{term.name}</span>
            <span className="text-muted-foreground text-[10px]">
              {formatNumber(term.count, locale)} {t('attributes.terms.colCount')}
            </span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => onEdit(term)}>
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive size-7"
                onClick={() => onDelete(term)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('attributes.terms.name')}</TableHead>
          <TableHead>{t('attributes.terms.slug')}</TableHead>
          <TableHead className="text-end">{t('attributes.terms.colCount')}</TableHead>
          <TableHead className="w-28" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {terms.map((term) => (
          <TableRow key={term.id}>
            <TableCell>
              <span className="inline-flex items-center gap-2">
                {attributeType === 'button' ? (
                  <span className="rounded-md border px-2 py-0.5 text-xs">{term.name}</span>
                ) : (
                  term.name
                )}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{term.slug}</TableCell>
            <TableCell className="text-end">{formatNumber(term.count, locale)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onEdit(term)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onDelete(term)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
