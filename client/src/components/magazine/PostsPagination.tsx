import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatNumber } from '@/lib/formatNumber'

type PostsPaginationProps = {
  page: number
  perPage: number
  found: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  showPerPageSelector?: boolean
}

export function PostsPagination({
  page,
  perPage,
  found,
  onPageChange,
  onPerPageChange,
  showPerPageSelector = true,
}: PostsPaginationProps) {
  const { t, i18n } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(found / perPage))
  const locale = i18n.language

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <div className="flex items-center gap-2">
        {showPerPageSelector ? (
          <>
            <Label htmlFor="posts-per-page" className="text-sm text-muted-foreground">
              {t('posts.perPage')}
            </Label>
            <Select
              value={String(perPage)}
              onValueChange={(v) => onPerPageChange(parseInt(v, 10) || 20)}
            >
              <SelectTrigger id="posts-per-page" className="h-8 w-[5.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {formatNumber(n, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        {t('posts.pageOf', {
          page: formatNumber(page, locale),
          total: formatNumber(totalPages, locale),
        })}
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t('common.prevPage')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || found === 0}
          onClick={() => onPageChange(page + 1)}
        >
          {t('common.nextPage')}
        </Button>
      </div>
    </div>
  )
}
