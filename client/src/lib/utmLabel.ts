/** Sentinel used by order-reports PHP for empty UTM attribution. */
export const UTM_NONE = '(direct/none)'

const UTM_ALIASES: Record<string, string> = {
  '': 'direct',
  '(direct/none)': 'direct',
  direct: 'direct',
  none: 'direct',
  typein: 'direct',
  '(none)': 'direct',
  instagram: 'instagram',
  ig: 'instagram',
  'ig.me': 'instagram',
  torob: 'torob',
  torobpay: 'torobpay',
  'torob-pay': 'torobpay',
  'torob_pay': 'torobpay',
  snapppay: 'snapppay',
  'snapp-pay': 'snapppay',
  'snapp_pay': 'snapppay',
  snapp: 'snapppay',
  google: 'google',
  'google-cpc': 'google',
  'google_cpc': 'google',
  cpc: 'google',
  adwords: 'google',
  'google ads': 'google',
  telegram: 'telegram',
  't.me': 'telegram',
  facebook: 'facebook',
  fb: 'facebook',
  meta: 'facebook',
  basalam: 'basalam',
  digikala: 'digikala',
  snappshop: 'snappshop',
  tapsishop: 'tapsishop',
  technolife: 'technolife',
  emalls: 'emalls',
  zarehbin: 'zarehbin',
  organic: 'organic',
  referral: 'referral',
  email: 'email',
  sms: 'sms',
}

/**
 * Human-readable UTM source/medium/campaign label.
 */
export function utmDisplayLabel(value: string | undefined | null, t: (key: string) => string): string {
  const raw = String(value ?? '').trim()
  const alias = UTM_ALIASES[raw.toLowerCase()] ?? UTM_ALIASES[raw]
  if (alias) {
    const translated = t(`reports.utm.${alias}`)
    if (translated && translated !== `reports.utm.${alias}`) {
      return translated
    }
  }
  if (!raw || raw === UTM_NONE) {
    return t('reports.utm.direct')
  }
  const badgeKey = `marketplace.badge.${raw.toLowerCase()}`
  const badge = t(badgeKey)
  if (badge && badge !== badgeKey) {
    return badge
  }
  return raw
}
