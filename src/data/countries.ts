export type Country = {
  name: string
  iso: string
  dial: string
  flag: string
  min: number
  max: number
}

export const COUNTRIES: Country[] = [
  { name: 'Bangladesh', iso: 'BD', dial: '880', flag: '🇧🇩', min: 10, max: 11 },
  { name: 'India', iso: 'IN', dial: '91', flag: '🇮🇳', min: 10, max: 10 },
  { name: 'Pakistan', iso: 'PK', dial: '92', flag: '🇵🇰', min: 10, max: 10 },
  { name: 'Nepal', iso: 'NP', dial: '977', flag: '🇳🇵', min: 10, max: 10 },
  { name: 'Sri Lanka', iso: 'LK', dial: '94', flag: '🇱🇰', min: 9, max: 9 },
  { name: 'United States', iso: 'US', dial: '1', flag: '🇺🇸', min: 10, max: 10 },
  { name: 'Canada', iso: 'CA', dial: '1', flag: '🇨🇦', min: 10, max: 10 },
  { name: 'United Kingdom', iso: 'GB', dial: '44', flag: '🇬🇧', min: 10, max: 11 },
  { name: 'United Arab Emirates', iso: 'AE', dial: '971', flag: '🇦🇪', min: 9, max: 9 },
  { name: 'Saudi Arabia', iso: 'SA', dial: '966', flag: '🇸🇦', min: 9, max: 9 },
  { name: 'Qatar', iso: 'QA', dial: '974', flag: '🇶🇦', min: 8, max: 8 },
  { name: 'Malaysia', iso: 'MY', dial: '60', flag: '🇲🇾', min: 9, max: 10 },
  { name: 'Singapore', iso: 'SG', dial: '65', flag: '🇸🇬', min: 8, max: 8 },
  { name: 'Australia', iso: 'AU', dial: '61', flag: '🇦🇺', min: 9, max: 9 },
  { name: 'Germany', iso: 'DE', dial: '49', flag: '🇩🇪', min: 10, max: 11 },
  { name: 'France', iso: 'FR', dial: '33', flag: '🇫🇷', min: 9, max: 9 },
  { name: 'Italy', iso: 'IT', dial: '39', flag: '🇮🇹', min: 9, max: 10 },
  { name: 'Spain', iso: 'ES', dial: '34', flag: '🇪🇸', min: 9, max: 9 },
  { name: 'Turkey', iso: 'TR', dial: '90', flag: '🇹🇷', min: 10, max: 10 },
  { name: 'Japan', iso: 'JP', dial: '81', flag: '🇯🇵', min: 10, max: 11 },
  { name: 'China', iso: 'CN', dial: '86', flag: '🇨🇳', min: 11, max: 11 },
  { name: 'South Korea', iso: 'KR', dial: '82', flag: '🇰🇷', min: 9, max: 11 },
  { name: 'Thailand', iso: 'TH', dial: '66', flag: '🇹🇭', min: 9, max: 9 },
  { name: 'Indonesia', iso: 'ID', dial: '62', flag: '🇮🇩', min: 10, max: 12 },
  { name: 'Philippines', iso: 'PH', dial: '63', flag: '🇵🇭', min: 10, max: 10 },
  { name: 'Nigeria', iso: 'NG', dial: '234', flag: '🇳🇬', min: 10, max: 10 },
  { name: 'South Africa', iso: 'ZA', dial: '27', flag: '🇿🇦', min: 9, max: 9 },
  { name: 'Brazil', iso: 'BR', dial: '55', flag: '🇧🇷', min: 10, max: 11 },
  { name: 'Mexico', iso: 'MX', dial: '52', flag: '🇲🇽', min: 10, max: 10 },
  { name: 'Netherlands', iso: 'NL', dial: '31', flag: '🇳🇱', min: 9, max: 9 },
]

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export function validatePhone(dial: string, local: string) {
  const country = COUNTRIES.find((c) => c.dial === dial)
  let n = digitsOnly(local)
  if (!n) return false
  if (n.startsWith(dial)) n = n.slice(dial.length)
  if (dial === '880' && n.startsWith('0')) n = n.slice(1)
  if (!country) return n.length >= 8 && n.length <= 15
  return n.length >= country.min && n.length <= country.max
}

export function e164(dial: string, local: string) {
  let n = digitsOnly(local)
  if (n.startsWith(dial)) return n
  if (n.startsWith('0')) n = n.slice(1)
  return `${dial}${n}`
}
