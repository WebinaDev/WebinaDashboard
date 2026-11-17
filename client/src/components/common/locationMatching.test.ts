import { describe, expect, it } from 'vitest'

import {
  isCitySelectorActive,
  matchCityOption,
  matchStateOption,
  normalizeGeoText,
  type LocationOption,
} from './locationMatching'

const STATES: LocationOption[] = [
  { id: 'TE', code: 'TE', label: 'تهران' },
  { id: 'AL', code: 'AL', label: 'البرز' },
  { id: 'IS', code: 'IS', label: 'اصفهان' },
  { id: 'KV', code: 'KV', label: 'خراسان رضوی' },
  { id: '123', code: 'EAZ', label: 'آذربایجان شرقی' },
]

const CITIES: LocationOption[] = [
  { id: '101', label: 'تهران' },
  { id: '102', label: 'شهریار' },
  { id: '103', label: 'رباط کریم' },
]

describe('locationMatching', () => {
  it('disables selector enhancements whenever flag is missing or false', () => {
    expect(isCitySelectorActive(undefined)).toBe(false)
    expect(isCitySelectorActive(null)).toBe(false)
    expect(isCitySelectorActive({})).toBe(false)
    expect(isCitySelectorActive({ city_selector_enabled: false })).toBe(false)
    expect(isCitySelectorActive({ city_selector_enabled: true })).toBe(true)
  })

  it('matches WooCommerce Iran codes, IR: prefixes, numeric ids and Persian/Arabic labels', () => {
    expect(matchStateOption(STATES, 'THR')?.label).toBe('تهران')
    expect(matchStateOption(STATES, 'IR:TE')?.label).toBe('تهران')
    expect(matchStateOption(STATES, 'ABZ')?.label).toBe('البرز')
    expect(matchStateOption(STATES, 'ESF')?.label).toBe('اصفهان')
    expect(matchStateOption(STATES, 'RKH')?.label).toBe('خراسان رضوی')
    expect(matchStateOption(STATES, '123')?.label).toBe('آذربایجان شرقی')
    expect(matchStateOption(STATES, 'تهران')?.id).toBe('TE')
    expect(matchStateOption(STATES, normalizeGeoText('آذربايجان\u200Cشرقي'))?.id).toBe('123')
    expect(matchStateOption(STATES, 'خراسان\u200Cرضوي')?.id).toBe('KV')
  })

  it('matches cities by id, exact label, or normalized Persian characters', () => {
    expect(matchCityOption(CITIES, '102')?.label).toBe('شهریار')
    expect(matchCityOption(CITIES, 'تهران')?.id).toBe('101')
    expect(matchCityOption(CITIES, 'رباط\u200Cكريم')?.id).toBe('103')
  })
})
