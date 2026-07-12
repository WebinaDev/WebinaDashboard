import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HomeRecentListProps = {
  title: string
  viewAllHref?: string
  children: ReactNode
}

export function HomeRecentList({ title, viewAllHref, children }: HomeRecentListProps) {
  const { t } = useTranslation()

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {viewAllHref ? (
          <Link className="text-primary text-xs hover:underline" to={viewAllHref}>
            {t('home.viewAll')}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function HomeRecentEmpty({ message, cta }: { message: string; cta?: { label: string; href: string } }) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>{message}</p>
      {cta ? (
        <Button asChild size="sm" variant="outline">
          <Link to={cta.href}>{cta.label}</Link>
        </Button>
      ) : null}
    </div>
  )
}
