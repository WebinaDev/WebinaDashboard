import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/lib/api'

import {
  isCitySelectorActive,
  matchCityOption,
  matchStateOption,
  type LocationOption,
  type LocationsPayload,
} from './locationMatching'

export type LocationMeta = {
  id?: string
  code?: string
  label?: string
}

type LocationStateCityFieldsProps = {
  stateValue: string
  cityValue: string
  onStateChange: (value: string, meta?: LocationMeta) => void
  onCityChange: (value: string, meta?: LocationMeta) => void
  variant?: 'labeled' | 'compact'
  stateLabel?: string
  cityLabel?: string
  statePlaceholder?: string
  cityPlaceholder?: string
}

const CUSTOM_SENTINEL = '__webino_custom__'

export function LocationStateCityFields({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
  variant = 'labeled',
  stateLabel,
  cityLabel,
  statePlaceholder,
  cityPlaceholder,
}: LocationStateCityFieldsProps) {
  const { t } = useTranslation()
  const [manualOverride, setManualOverride] = useState(false)

  const locQ = useQuery({
    queryKey: ['shop-locations-states'],
    queryFn: () => apiFetch<LocationsPayload>('shop/locations/states'),
    staleTime: 60_000,
    retry: 1,
  })

  const selectorActive = isCitySelectorActive(locQ.data)
  const states = useMemo(() => locQ.data?.items ?? [], [locQ.data?.items])
  const matchedState = useMemo(() => matchStateOption(states, stateValue), [states, stateValue])

  const citiesQ = useQuery({
    queryKey: ['shop-locations-cities', matchedState?.id ?? ''],
    queryFn: () =>
      apiFetch<{ items: LocationOption[] }>(
        `shop/locations/cities?state=${encodeURIComponent(matchedState?.id ?? '')}`,
      ),
    enabled: selectorActive && !manualOverride && Boolean(matchedState?.id),
    staleTime: 60_000,
  })

  const cities = useMemo(() => citiesQ.data?.items ?? [], [citiesQ.data?.items])
  const matchedCity = useMemo(() => matchCityOption(cities, cityValue), [cities, cityValue])

  const useDropdown = selectorActive && !manualOverride && states.length > 0

  if (!useDropdown) {
    const manualToggle =
      selectorActive && states.length > 0 ? (
        <div className={variant === 'compact' ? 'col-span-2 flex justify-end' : 'flex justify-end'}>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 py-0 text-xs"
            onClick={() => setManualOverride(false)}
          >
            {t('location.useDropdown')}
          </Button>
        </div>
      ) : null

    if (variant === 'compact') {
      return (
        <>
          <Input
            placeholder={statePlaceholder}
            value={stateValue}
            onChange={(e) => onStateChange(e.target.value)}
          />
          <Input
            placeholder={cityPlaceholder}
            value={cityValue}
            onChange={(e) => onCityChange(e.target.value)}
          />
          {manualToggle}
        </>
      )
    }

    return (
      <>
        <div>
          {stateLabel ? <Label className="text-xs">{stateLabel}</Label> : null}
          <Input
            className="mt-1"
            placeholder={statePlaceholder}
            value={stateValue}
            onChange={(e) => onStateChange(e.target.value)}
          />
        </div>
        <div>
          {cityLabel ? <Label className="text-xs">{cityLabel}</Label> : null}
          <Input
            className="mt-1"
            placeholder={cityPlaceholder}
            value={cityValue}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </div>
        {manualToggle}
      </>
    )
  }

  const trimmedState = stateValue.trim()
  const stateSelectValue = matchedState ? matchedState.id : trimmedState ? CUSTOM_SENTINEL : undefined

  const trimmedCity = cityValue.trim()
  const citySelectValue = matchedCity ? matchedCity.id : trimmedCity ? CUSTOM_SENTINEL : undefined

  const stateControl = (
    <Select
      value={stateSelectValue}
      onValueChange={(val) => {
        if (val === CUSTOM_SENTINEL) return
        const found = states.find((s) => s.id === val)
        if (!found) return
        onStateChange(found.label, { id: found.id, code: found.code, label: found.label })
        if (matchedState?.id !== found.id) {
          onCityChange('', undefined)
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={statePlaceholder || t('location.pickState')} />
      </SelectTrigger>
      <SelectContent>
        {!matchedState && trimmedState ? (
          <SelectItem value={CUSTOM_SENTINEL}>{trimmedState}</SelectItem>
        ) : null}
        {states.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const cityControl =
    matchedState && (cities.length > 0 || citiesQ.isFetching) ? (
      <Select
        value={citySelectValue}
        disabled={citiesQ.isFetching && cities.length === 0}
        onValueChange={(val) => {
          if (val === CUSTOM_SENTINEL) return
          const found = cities.find((c) => c.id === val)
          if (!found) return
          onCityChange(found.label, { id: found.id, label: found.label })
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              citiesQ.isFetching && cities.length === 0
                ? t('common.loading')
                : cityPlaceholder || t('location.pickCity')
            }
          />
        </SelectTrigger>
        <SelectContent>
          {!matchedCity && trimmedCity ? (
            <SelectItem value={CUSTOM_SENTINEL}>{trimmedCity}</SelectItem>
          ) : null}
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        placeholder={cityPlaceholder || t('location.pickCity')}
        value={cityValue}
        onChange={(e) => onCityChange(e.target.value)}
      />
    )

  const toggleManualBtn = (
    <Button
      type="button"
      variant="link"
      size="sm"
      className="h-auto px-0 py-0 text-xs"
      onClick={() => setManualOverride(true)}
    >
      {t('location.enterManually')}
    </Button>
  )

  if (variant === 'compact') {
    return (
      <>
        <div>{stateControl}</div>
        <div>{cityControl}</div>
        <div className="col-span-2 flex justify-end">{toggleManualBtn}</div>
      </>
    )
  }

  return (
    <>
      <div>
        {stateLabel ? <Label className="text-xs">{stateLabel}</Label> : null}
        <div className="mt-1">{stateControl}</div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          {cityLabel ? <Label className="text-xs">{cityLabel}</Label> : <span />}
          {toggleManualBtn}
        </div>
        <div className="mt-1">{cityControl}</div>
      </div>
    </>
  )
}
