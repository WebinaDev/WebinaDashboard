import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

type ListFiltersCollapsibleProps = {
  children: ReactNode
  /** Number of active filters for badge. */
  activeCount?: number
  className?: string
  /** Force open (e.g. desktop always). Defaults: closed mobile, open desktop. */
  defaultOpen?: boolean
}

export function ListFiltersCollapsible({
  children,
  activeCount = 0,
  className,
  defaultOpen,
}: ListFiltersCollapsibleProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(() => defaultOpen ?? !isMobile)

  useEffect(() => {
    if (defaultOpen !== undefined) return
    setOpen(!isMobile)
  }, [isMobile, defaultOpen])

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn(className)}>
      <Card>
        <CardHeader className="p-0">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-muted/40"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {t('list.filters')}
                {activeCount > 0 ? (
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                    {activeCount}
                  </Badge>
                ) : null}
              </span>
              <ChevronDown
                className={cn('text-muted-foreground size-4 shrink-0 transition-transform', open && 'rotate-180')}
              />
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="border-t pt-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
