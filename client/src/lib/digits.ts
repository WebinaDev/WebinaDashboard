export const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const FA_DIGIT_MAP: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
}

export function isFaLocale(locale: string): boolean {
  return locale.toLowerCase().startsWith('fa')
}

export function toPersianDigits(s: string): string {
  return s.replace(/\d/g, (d) => FA_DIGITS[parseInt(d, 10)] ?? d)
}

/** Convert Persian/Arabic-Indic digits to ASCII 0-9. */
export function toAsciiDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (d) => FA_DIGIT_MAP[d] ?? d)
}

export function localizeDigits(s: string, locale: string): string {
  return isFaLocale(locale) ? toPersianDigits(s) : s
}
