import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HomeDisabledSectionProps = {
  titleKey: string
  messageKey: string
  href?: string
  linkKey?: string
}

export function HomeDisabledSection({ titleKey, messageKey, href, linkKey }: HomeDisabledSectionProps) {
  const { t } = useTranslation()

  return (
    <Card className="border-dashed shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{t(messageKey)}</p>
        {href && linkKey ? (
          <Link className="text-primary text-xs hover:underline" to={href}>
            {t(linkKey)}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
