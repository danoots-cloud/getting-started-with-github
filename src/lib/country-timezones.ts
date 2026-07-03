// IANA time zones per country (ISO-2). For countries with multiple zones,
// we include one representative zone per distinct offset with a short label.
// Offsets are computed live at render time so DST is always correct.

export interface CountryZone {
  zone: string
  label?: string // short region label, only used when a country has 2+ zones
}

export const COUNTRY_TIMEZONES: Record<string, CountryZone[]> = {
  // Europe (single zone unless noted)
  AT: [{ zone: 'Europe/Vienna' }],
  CH: [{ zone: 'Europe/Zurich' }],
  CZ: [{ zone: 'Europe/Prague' }],
  HU: [{ zone: 'Europe/Budapest' }],
  PL: [{ zone: 'Europe/Warsaw' }],
  FR: [{ zone: 'Europe/Paris' }],
  IT: [{ zone: 'Europe/Rome' }],
  GR: [{ zone: 'Europe/Athens' }],
  ES: [
    { zone: 'Europe/Madrid', label: 'Mainland' },
    { zone: 'Atlantic/Canary', label: 'Canary Is.' },
  ],
  IS: [{ zone: 'Atlantic/Reykjavik' }],
  NO: [{ zone: 'Europe/Oslo' }],
  SE: [{ zone: 'Europe/Stockholm' }],
  FI: [{ zone: 'Europe/Helsinki' }],
  NL: [{ zone: 'Europe/Amsterdam' }],
  BE: [{ zone: 'Europe/Brussels' }],
  DK: [{ zone: 'Europe/Copenhagen' }],
  IE: [{ zone: 'Europe/Dublin' }],
  GB: [{ zone: 'Europe/London' }],
  DE: [{ zone: 'Europe/Berlin' }],
  PT: [
    { zone: 'Europe/Lisbon', label: 'Mainland' },
    { zone: 'Atlantic/Azores', label: 'Azores' },
  ],
  HR: [{ zone: 'Europe/Zagreb' }],
  RO: [{ zone: 'Europe/Bucharest' }],
  RS: [{ zone: 'Europe/Belgrade' }],
  SI: [{ zone: 'Europe/Ljubljana' }],
  SK: [{ zone: 'Europe/Bratislava' }],
  UA: [{ zone: 'Europe/Kyiv' }],
  TR: [{ zone: 'Europe/Istanbul' }],
  GE: [{ zone: 'Asia/Tbilisi' }],

  // Russia — several key zones
  RU: [
    { zone: 'Europe/Moscow', label: 'Moscow' },
    { zone: 'Asia/Yekaterinburg', label: 'Urals' },
    { zone: 'Asia/Novosibirsk', label: 'Novosibirsk' },
    { zone: 'Asia/Vladivostok', label: 'Vladivostok' },
    { zone: 'Asia/Kamchatka', label: 'Kamchatka' },
  ],

  // Americas
  US: [
    { zone: 'America/New_York', label: 'East' },
    { zone: 'America/Chicago', label: 'Central' },
    { zone: 'America/Denver', label: 'Mountain' },
    { zone: 'America/Los_Angeles', label: 'West' },
    { zone: 'America/Anchorage', label: 'Alaska' },
    { zone: 'Pacific/Honolulu', label: 'Hawaii' },
  ],
  CA: [
    { zone: 'America/Toronto', label: 'East' },
    { zone: 'America/Winnipeg', label: 'Central' },
    { zone: 'America/Edmonton', label: 'Mountain' },
    { zone: 'America/Vancouver', label: 'Pacific' },
    { zone: 'America/St_Johns', label: 'Newfoundland' },
  ],
  MX: [
    { zone: 'America/Mexico_City', label: 'Central' },
    { zone: 'America/Chihuahua', label: 'Pacific' },
    { zone: 'America/Tijuana', label: 'Northwest' },
  ],
  GL: [
    { zone: 'America/Nuuk', label: 'Nuuk' },
    { zone: 'America/Danmarkshavn', label: 'East coast' },
    { zone: 'America/Thule', label: 'Thule' },
  ],
  BR: [
    { zone: 'America/Sao_Paulo', label: 'East/Brasília' },
    { zone: 'America/Manaus', label: 'Amazon' },
    { zone: 'America/Noronha', label: 'Fernando de Noronha' },
  ],
  AR: [{ zone: 'America/Argentina/Buenos_Aires' }],
  CL: [
    { zone: 'America/Santiago', label: 'Mainland' },
    { zone: 'Pacific/Easter', label: 'Easter Is.' },
  ],
  EC: [
    { zone: 'America/Guayaquil', label: 'Mainland' },
    { zone: 'Pacific/Galapagos', label: 'Galápagos' },
  ],
  BO: [{ zone: 'America/La_Paz' }],
  UY: [{ zone: 'America/Montevideo' }],
  PE: [{ zone: 'America/Lima' }],
  CO: [{ zone: 'America/Bogota' }],
  VE: [{ zone: 'America/Caracas' }],
  GY: [{ zone: 'America/Guyana' }],
  PY: [{ zone: 'America/Asuncion' }],
  SR: [{ zone: 'America/Paramaribo' }],
  CU: [{ zone: 'America/Havana' }],
  DO: [{ zone: 'America/Santo_Domingo' }],
  JM: [{ zone: 'America/Jamaica' }],
  CR: [{ zone: 'America/Costa_Rica' }],
  BZ: [{ zone: 'America/Belize' }],
  GT: [{ zone: 'America/Guatemala' }],
  SV: [{ zone: 'America/El_Salvador' }],
  HN: [{ zone: 'America/Tegucigalpa' }],
  NI: [{ zone: 'America/Managua' }],
  PA: [{ zone: 'America/Panama' }],

  // Asia
  JP: [{ zone: 'Asia/Tokyo' }],
  KR: [{ zone: 'Asia/Seoul' }],
  CN: [{ zone: 'Asia/Shanghai' }],
  IN: [{ zone: 'Asia/Kolkata' }],
  TH: [{ zone: 'Asia/Bangkok' }],
  VN: [{ zone: 'Asia/Ho_Chi_Minh' }],
  ID: [
    { zone: 'Asia/Jakarta', label: 'West' },
    { zone: 'Asia/Makassar', label: 'Central' },
    { zone: 'Asia/Jayapura', label: 'East' },
  ],
  SA: [{ zone: 'Asia/Riyadh' }],
  KH: [{ zone: 'Asia/Phnom_Penh' }],
  LK: [{ zone: 'Asia/Colombo' }],
  PH: [{ zone: 'Asia/Manila' }],
  AE: [{ zone: 'Asia/Dubai' }],
  SG: [{ zone: 'Asia/Singapore' }],
  NP: [{ zone: 'Asia/Kathmandu' }],
  IL: [{ zone: 'Asia/Jerusalem' }],
  JO: [{ zone: 'Asia/Amman' }],
  MY: [{ zone: 'Asia/Kuala_Lumpur' }],
  MN: [{ zone: 'Asia/Ulaanbaatar' }],
  KZ: [
    { zone: 'Asia/Almaty', label: 'East' },
    { zone: 'Asia/Aqtobe', label: 'West' },
  ],
  UZ: [{ zone: 'Asia/Tashkent' }],
  QA: [{ zone: 'Asia/Qatar' }],
  OM: [{ zone: 'Asia/Muscat' }],
  BT: [{ zone: 'Asia/Thimphu' }],
  MV: [{ zone: 'Indian/Maldives' }],
  MM: [{ zone: 'Asia/Yangon' }],
  LA: [{ zone: 'Asia/Vientiane' }],

  // Africa
  EG: [{ zone: 'Africa/Cairo' }],
  ZA: [{ zone: 'Africa/Johannesburg' }],
  MA: [{ zone: 'Africa/Casablanca' }],
  KE: [{ zone: 'Africa/Nairobi' }],
  TZ: [{ zone: 'Africa/Dar_es_Salaam' }],
  NG: [{ zone: 'Africa/Lagos' }],
  ET: [{ zone: 'Africa/Addis_Ababa' }],
  GH: [{ zone: 'Africa/Accra' }],
  TN: [{ zone: 'Africa/Tunis' }],
  SN: [{ zone: 'Africa/Dakar' }],
  NA: [{ zone: 'Africa/Windhoek' }],
  BW: [{ zone: 'Africa/Gaborone' }],
  UG: [{ zone: 'Africa/Kampala' }],
  RW: [{ zone: 'Africa/Kigali' }],
  DZ: [{ zone: 'Africa/Algiers' }],
  MG: [{ zone: 'Indian/Antananarivo' }],
  MZ: [{ zone: 'Africa/Maputo' }],
  ZW: [{ zone: 'Africa/Harare' }],

  // Oceania
  AU: [
    { zone: 'Australia/Sydney', label: 'East' },
    { zone: 'Australia/Adelaide', label: 'Central' },
    { zone: 'Australia/Perth', label: 'West' },
  ],
  NZ: [
    { zone: 'Pacific/Auckland', label: 'Mainland' },
    { zone: 'Pacific/Chatham', label: 'Chatham Is.' },
  ],
  FJ: [{ zone: 'Pacific/Fiji' }],
  PF: [{ zone: 'Pacific/Tahiti' }],
  WS: [{ zone: 'Pacific/Apia' }],
  VU: [{ zone: 'Pacific/Efate' }],
}

const NJ_ZONE = 'America/New_York'

function offsetMinutes(zone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'longOffset',
    hour: 'numeric',
  }).formatToParts(at)
  const raw = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0'
  const m = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!m) return 0
  const sign = m[1] === '+' ? 1 : -1
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] ?? '0', 10))
}

function formatDiff(diffMinutes: number): string {
  if (diffMinutes === 0) return 'Same time as NJ'
  const ahead = diffMinutes > 0
  const abs = Math.abs(diffMinutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const hPart = h > 0 ? `${h}h` : ''
  const mPart = m > 0 ? `${m}m` : ''
  const time = [hPart, mPart].filter(Boolean).join(' ')
  return `${time} ${ahead ? 'ahead of' : 'behind'} NJ`
}

export interface TimeDiffEntry {
  label?: string
  text: string
  diffMinutes: number
}

export function getTimeDifferences(code: string, now: Date = new Date()): TimeDiffEntry[] {
  const zones = COUNTRY_TIMEZONES[code]
  if (!zones || zones.length === 0) return []
  const njOffset = offsetMinutes(NJ_ZONE, now)

  // Dedupe by offset, keeping first-seen label(s).
  const byOffset = new Map<number, string[]>()
  for (const z of zones) {
    const diff = offsetMinutes(z.zone, now) - njOffset
    const labels = byOffset.get(diff) ?? []
    if (z.label) labels.push(z.label)
    byOffset.set(diff, labels)
  }

  return Array.from(byOffset.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([diff, labels]) => ({
      diffMinutes: diff,
      label: labels.length > 0 ? labels.join(' / ') : undefined,
      text: formatDiff(diff),
    }))
}
