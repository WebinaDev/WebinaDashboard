export type AnalyticsSectionId =
  | 'overview'
  | 'visitors'
  | 'pages'
  | 'referrals'
  | 'geo'
  | 'devices'
  | 'commerce'
  | 'compare'
  | 'seo'
  | 'support'
  | 'content'
  | 'month-summary'

export const ANALYTICS_SECTIONS: AnalyticsSectionId[] = [
  'overview',
  'visitors',
  'pages',
  'referrals',
  'geo',
  'devices',
  'commerce',
  'compare',
  'seo',
  'support',
  'content',
  'month-summary',
]

export function isAnalyticsSection(s: string | undefined): s is AnalyticsSectionId {
  return !!s && (ANALYTICS_SECTIONS as readonly string[]).includes(s)
}

export function analyticsPeriodQuery(from: number, to: number) {
  return `from=${from}&to=${to}`
}
