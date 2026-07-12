import gregorianModule from "react-date-object/calendars/gregorian"
import persianModule from "react-date-object/calendars/persian"
import gregorianEnModule from "react-date-object/locales/gregorian_en"
import persianFaModule from "react-date-object/locales/persian_fa"

import { hasDateObjectName, unwrapDefaultExport } from "@/lib/cjs-default"

const gregorian = unwrapDefaultExport(gregorianModule)
const persian = unwrapDefaultExport(persianModule)
const gregorian_en = unwrapDefaultExport(gregorianEnModule)
const persian_fa = unwrapDefaultExport(persianFaModule)

export type AppLocale = "fa" | "en"

export function getCalendarConfig(lang: AppLocale = "fa") {
  const faCalendar = hasDateObjectName(persian) ? persian : gregorian
  const faLocale = hasDateObjectName(persian_fa) ? persian_fa : gregorian_en
  const enCalendar = hasDateObjectName(gregorian) ? gregorian : faCalendar
  const enLocale = hasDateObjectName(gregorian_en) ? gregorian_en : faLocale

  if (lang === "fa") {
    return { calendar: faCalendar, locale: faLocale }
  }
  return { calendar: enCalendar, locale: enLocale }
}
