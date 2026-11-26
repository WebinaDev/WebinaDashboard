import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BasalamNav } from '../../components/BasalamNav'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Three-step Basalam onboarding, ported from the retired wp-admin "آموزش باسلام" wizard.
 * Each step links to the dashboard surface that performs it instead of posting an admin form.
 */
export default function BasalamOnboardingPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: t('basalam.onboardingStep1Title'),
      body: t('basalam.onboardingStep1Body'),
      to: '/settings/shop/basalam',
      cta: t('basalam.onboardingStep1Cta'),
    },
    {
      title: t('basalam.onboardingStep2Title'),
      body: t('basalam.onboardingStep2Body'),
      to: '/settings/shop/basalam',
      cta: t('basalam.onboardingStep2Cta'),
    },
    {
      title: t('basalam.onboardingStep3Title'),
      body: t('basalam.onboardingStep3Body'),
      to: '/settings/shop/basalam/products',
      cta: t('basalam.onboardingStep3Cta'),
    },
  ]

  const current = steps[step - 1]

  return (
    <PageShell title={t('basalam.onboardingTitle')} description={t('basalam.onboardingSubtitle')}>
      <BasalamNav />

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {steps.map((s, i) => {
              const n = i + 1
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setStep(n)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors',
                    n === step
                      ? 'bg-primary text-primary-foreground border-primary'
                      : n < step
                        ? 'border-primary/40 text-primary'
                        : 'text-muted-foreground',
                  )}
                >
                  <span className="font-semibold">{n}</span>
                  <span>{s.title}</span>
                </button>
              )
            })}
          </div>
          <CardTitle className="pt-2">{current.title}</CardTitle>
          <CardDescription>{current.body}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={current.to}>{current.cta}</Link>
          </Button>
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep((v) => Math.max(1, v - 1))}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="outline"
            disabled={step === steps.length}
            onClick={() => setStep((v) => Math.min(steps.length, v + 1))}
          >
            {t('common.next')}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
