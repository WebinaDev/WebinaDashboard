export type LocationOption = {
  id: string
  code?: string
  label: string
}

export type LocationsPayload = {
  items: LocationOption[]
  city_selector_enabled?: boolean
}

const STATE_CODE_ALIASES: Record<string, string> = {
  WAZ: 'AW',
  EAZ: 'AE',
  ESF: 'IS',
  ISFAHAN: 'IS',
  ABZ: 'AL',
  ALB: 'AL',
  ALBORZ: 'AL',
  THR: 'TE',
  TEH: 'TE',
  TEHRAN: 'TE',
  RKH: 'KV',
  KJR: 'KV',
  KHZ: 'KZ',
  FRS: 'FA',
  MZN: 'MN',
  ZJN: 'ZA',
  ADL: 'AR',
  ILM: 'IL',
  BHR: 'BU',
  CHB: 'CM',
  NKH: 'KS',
  KJS: 'KS',
  SKH: 'KJ',
  SMN: 'SM',
  SBN: 'SB',
  GZN: 'QZ',
  QZN: 'QZ',
  QHM: 'QM',
  KRD: 'KD',
  KRN: 'KE',
  KRH: 'BK',
  KBD: 'KB',
  GLS: 'GO',
  GIL: 'GI',
  LRS: 'LO',
  MKZ: 'MK',
  HRZ: 'HG',
  HDN: 'HD',
  YZD: 'YA',
}

export function normalizeGeoText(value: string): string {
  return String(value || '')
    .replace(/[\u200C\u00A0]/g, ' ')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalStateCode(raw: string): string {
  const clean = String(raw || '')
    .trim()
    .replace(/^IR:/i, '')
    .toUpperCase()
  return STATE_CODE_ALIASES[clean] || clean
}

export function matchStateOption(states: LocationOption[], rawValue: string): LocationOption | undefined {
  const raw = String(rawValue || '').trim()
  if (!raw || states.length === 0) return undefined

  const exactId = states.find((s) => s.id === raw || s.code === raw)
  if (exactId) return exactId

  const needleCode = canonicalStateCode(raw)
  const byCode = states.find((s) => {
    const sCode = s.code ? canonicalStateCode(s.code) : ''
    const sId = canonicalStateCode(s.id)
    return (sCode && sCode === needleCode) || (sId && sId === needleCode)
  })
  if (byCode) return byCode

  const needleName = normalizeGeoText(raw)
  return states.find((s) => normalizeGeoText(s.label) === needleName)
}

export function matchCityOption(cities: LocationOption[], rawValue: string): LocationOption | undefined {
  const raw = String(rawValue || '').trim()
  if (!raw || cities.length === 0) return undefined

  const exact = cities.find((c) => c.id === raw || c.label === raw)
  if (exact) return exact

  const needle = normalizeGeoText(raw)
  return cities.find((c) => normalizeGeoText(c.label) === needle)
}

export function isCitySelectorActive(payload?: { city_selector_enabled?: boolean } | null): boolean {
  return payload?.city_selector_enabled === true
}
