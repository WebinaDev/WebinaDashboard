import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/formatNumber'
import type { AttributeTerm, AttributeType } from '@/types/attributes'

type AttributeTermsTableProps = {
  terms: AttributeTerm[]
  attributeType: AttributeType
  locale: string
  onEdit: (term: AttributeTerm) => void
  onDelete: (term: AttributeTerm) => void
}

export function AttributeTermsTable({ terms, attributeType, locale, onEdit, onDelete }: AttributeTermsTableProps) {
  const { t } = useTranslation()

  if (terms.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">{t('attributes.terms.empty')}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {attributeType === 'color' || attributeType === 'image' ? <TableHead className="w-16" /> : null}
          <TableHead>{t('attributes.terms.name')}</TableHead>
          <TableHead>{t('attributes.terms.slug')}</TableHead>
          <TableHead className="text-end">{t('attributes.terms.colCount')}</TableHead>
          <TableHead className="w-28" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {terms.map((term) => (
          <TableRow key={term.id}>
            {attributeType === 'color' ? (
              <TableCell>
                {term.color ? (
                  <span className="inline-block size-6 rounded border" style={{ backgroundColor: term.color }} title={term.color} />
                ) : null}
              </TableCell>
            ) : null}
            {attributeType === 'image' ? (
              <TableCell>
                {term.image_url ? <LazyImage src={term.image_url} alt={term.name || t('a11y.thumbnail')} className="size-8 rounded object-cover" /> : null}
              </TableCell>
            ) : null}
            <TableCell>{term.name}</TableCell>
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
