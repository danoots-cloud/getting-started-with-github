// Travel requirements for US passport holders traveling from the USA.
// High-level: does this trip have hoops to jump through, or can you just show up?
//
// Source: U.S. State Department "Entry, Exit and Visa Requirements" pages
// (travel.state.gov). Rules change — the UI links back to the source page and
// tells users to verify before booking.
//
// - easy         → no advance registration; passport is enough on arrival
// - moderate     → quick online pre-registration (ETA / eVisa / K-ETA / ETIAS)
//                  or a paid visa-on-arrival with minimal docs
// - advance-prep → embassy visa, licensed operator, or notable complexity

export type TravelDifficulty = 'easy' | 'moderate' | 'advance-prep'

export interface TravelRequirements {
  difficulty: TravelDifficulty
  summary: string
  notes?: string[]
}

// Schengen countries currently visa-free 90 days; ETIAS pre-authorization is
// rolling out in late 2026, so we flag it as moderate with a shared note.
const ETIAS_NOTE = 'ETIAS pre-authorization required (rolling out late 2026)'
const SCHENGEN_SUMMARY =
  'Visa-free up to 90 days in any 180-day period across the Schengen area.'
const PASSPORT_6MO = 'Passport valid 6+ months beyond entry'
const PASSPORT_3MO_BEYOND_SCHENGEN =
  'Passport valid 3+ months beyond planned departure'

function schengen(extra?: string[]): TravelRequirements {
  return {
    difficulty: 'moderate',
    summary: SCHENGEN_SUMMARY,
    notes: [ETIAS_NOTE, PASSPORT_3MO_BEYOND_SCHENGEN, ...(extra ?? [])],
  }
}

export const travelRequirements: Record<string, TravelRequirements> = {
  // ── Schengen area ────────────────────────────────────────────────────────
  AT: schengen(),
  BE: schengen(),
  CH: schengen(), // Not EU but in Schengen
  CZ: schengen(),
  DE: schengen(),
  DK: schengen(),
  ES: schengen(),
  FI: schengen(),
  FR: schengen(),
  GR: schengen(),
  HR: schengen(),
  HU: schengen(),
  IS: schengen(),
  IT: schengen(),
  NL: schengen(),
  NO: schengen(),
  PL: schengen(),
  PT: schengen(),
  RO: schengen(), // Joined Schengen 2025
  SE: schengen(),
  SI: schengen(),
  SK: schengen(),

  // ── Europe, non-Schengen ─────────────────────────────────────────────────
  GB: {
    difficulty: 'moderate',
    summary: 'ETA required — quick online application before travel.',
    notes: ['Approval usually within minutes/hours', 'Valid 2 years, multiple entries'],
  },
  IE: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days. Not part of Schengen/ETIAS.',
    notes: [PASSPORT_6MO],
  },
  RS: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days in any 180-day period.',
  },
  UA: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days — but active conflict; see advisory.',
  },
  RU: {
    difficulty: 'advance-prep',
    summary: 'Tourist visa required in advance from a Russian consulate.',
    notes: ['Invitation letter required', 'Complex process; allow weeks'],
  },
  GE: {
    difficulty: 'easy',
    summary: 'Visa-free up to 365 days — one of the world’s most generous policies.',
  },
  GL: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days. Not part of Schengen despite Danish ties.',
    notes: [PASSPORT_3MO_BEYOND_SCHENGEN],
  },

  // ── North America ────────────────────────────────────────────────────────
  US: {
    difficulty: 'easy',
    summary: 'You’re already home. No requirements for domestic travel.',
  },
  CA: {
    difficulty: 'moderate',
    summary: 'eTA required for air travel; visa-free by land/sea.',
    notes: ['Approval typically within minutes', 'Valid 5 years'],
  },
  MX: {
    difficulty: 'easy',
    summary: 'Visa-free up to 180 days.',
    notes: ['FMM tourist form issued on arrival'],
  },

  // ── Central America & Caribbean ──────────────────────────────────────────
  BZ: { difficulty: 'easy', summary: 'Visa-free up to 30 days; extendable in-country.' },
  CR: { difficulty: 'easy', summary: 'Visa-free up to 180 days.', notes: [PASSPORT_6MO] },
  GT: { difficulty: 'easy', summary: 'Visa-free up to 90 days (CA-4 region).' },
  SV: { difficulty: 'easy', summary: 'Visa-free up to 90 days (CA-4 region).' },
  HN: { difficulty: 'easy', summary: 'Visa-free up to 90 days (CA-4 region).' },
  NI: {
    difficulty: 'moderate',
    summary: 'Tourist card issued on arrival (~$10 fee).',
    notes: [PASSPORT_6MO],
  },
  PA: { difficulty: 'easy', summary: 'Visa-free up to 180 days.', notes: [PASSPORT_3MO_BEYOND_SCHENGEN] },
  JM: { difficulty: 'easy', summary: 'Visa-free up to 90 days; immigration form required.' },
  DO: {
    difficulty: 'easy',
    summary: 'Visa-free up to 30 days; tourist card fee typically bundled with airfare.',
  },
  CU: {
    difficulty: 'advance-prep',
    summary: 'Tourist card required, plus a valid U.S. OFAC travel category.',
    notes: ['12 permitted travel categories under U.S. law', 'Standard tourism is not permitted'],
  },

  // ── South America ────────────────────────────────────────────────────────
  AR: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  BO: {
    difficulty: 'moderate',
    summary: 'Visa required — obtainable on arrival with docs & fee, or in advance.',
    notes: ['Yellow fever vaccination proof', 'Hotel booking, return ticket, photo'],
  },
  BR: {
    difficulty: 'moderate',
    summary: 'eVisa required (reinstated April 2025).',
    notes: ['Apply online; approval typically within days'],
  },
  CL: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  CO: { difficulty: 'easy', summary: 'Visa-free up to 90 days per entry; up to 180/year.' },
  EC: { difficulty: 'easy', summary: 'Visa-free up to 90 days per year.' },
  GY: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  PE: { difficulty: 'easy', summary: 'Visa-free up to 183 days per year.' },
  PY: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  SR: {
    difficulty: 'moderate',
    summary: 'e-Tourist Card required in advance (single entry, up to 90 days).',
  },
  UY: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  VE: {
    difficulty: 'advance-prep',
    summary: 'Tourist visa required; U.S.–Venezuela relations strained.',
    notes: ['Check State Dept advisory before planning'],
  },

  // ── East & Southeast Asia ────────────────────────────────────────────────
  JP: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  KR: {
    difficulty: 'moderate',
    summary: 'K-ETA required for visa-free entry (U.S. exempt through end of 2026).',
    notes: ['Confirm K-ETA status close to travel'],
  },
  CN: {
    difficulty: 'advance-prep',
    summary: 'Tourist (L) visa required in advance from a Chinese consulate.',
    notes: ['Some cities offer 144-hour transit visa-free', 'Application requires itinerary + invite/hotel'],
  },
  MN: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  TH: { difficulty: 'easy', summary: 'Visa-free up to 60 days (extended in 2024).' },
  MY: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  SG: { difficulty: 'easy', summary: 'Visa-free up to 90 days.', notes: [PASSPORT_6MO] },
  PH: { difficulty: 'easy', summary: 'Visa-free up to 30 days; extendable in-country.', notes: [PASSPORT_6MO] },
  ID: {
    difficulty: 'moderate',
    summary: 'Visa on arrival (~$35, 30 days) or eVisa in advance.',
    notes: [PASSPORT_6MO, 'Extendable once for another 30 days'],
  },
  VN: {
    difficulty: 'moderate',
    summary: 'eVisa required (up to 90 days, single or multiple entry).',
  },
  KH: {
    difficulty: 'moderate',
    summary: 'eVisa or visa on arrival (~$30).',
    notes: [PASSPORT_6MO],
  },
  LA: {
    difficulty: 'moderate',
    summary: 'Visa on arrival or eVisa (~$35).',
    notes: [PASSPORT_6MO],
  },
  MM: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (28-day tourist visa).',
  },

  // ── South Asia ───────────────────────────────────────────────────────────
  IN: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (options from 30 days to 5 years).',
    notes: ['Apply 4+ days before travel'],
  },
  NP: {
    difficulty: 'easy',
    summary: 'Visa on arrival — quick, straightforward, cash payment.',
    notes: ['15/30/90-day options; bring passport photo'],
  },
  BT: {
    difficulty: 'advance-prep',
    summary: 'Must book through a licensed Bhutanese tour operator.',
    notes: ['Daily Sustainable Development Fee applies', 'Operator arranges the visa'],
  },
  LK: {
    difficulty: 'moderate',
    summary: 'ETA required online before travel (~$50, 30 days).',
  },
  MV: { difficulty: 'easy', summary: 'Free 30-day visa issued on arrival.', notes: [PASSPORT_6MO] },

  // ── Central Asia ─────────────────────────────────────────────────────────
  KZ: { difficulty: 'easy', summary: 'Visa-free up to 30 days per entry.' },
  UZ: { difficulty: 'easy', summary: 'Visa-free up to 30 days.' },

  // ── Middle East ──────────────────────────────────────────────────────────
  IL: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days.',
    notes: [PASSPORT_6MO],
  },
  JO: {
    difficulty: 'moderate',
    summary: 'Visa on arrival (~40 JOD); free if using a Jordan Pass.',
    notes: ['Jordan Pass bundles visa + attraction entries'],
  },
  SA: {
    difficulty: 'moderate',
    summary: 'eVisa available online (1 year, multiple entry).',
    notes: [PASSPORT_6MO],
  },
  AE: { difficulty: 'easy', summary: 'Visa-free up to 30 days on arrival.', notes: [PASSPORT_6MO] },
  QA: { difficulty: 'easy', summary: 'Visa-free up to 30 days on arrival.', notes: [PASSPORT_6MO] },
  OM: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (10 or 30 days).',
    notes: [PASSPORT_6MO],
  },
  TR: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (~$50, 90 days within 180).',
  },

  // ── Africa ───────────────────────────────────────────────────────────────
  EG: {
    difficulty: 'moderate',
    summary: 'eVisa or visa on arrival (~$25, 30 days).',
    notes: [PASSPORT_6MO],
  },
  MA: { difficulty: 'easy', summary: 'Visa-free up to 90 days.', notes: [PASSPORT_6MO] },
  TN: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  DZ: {
    difficulty: 'advance-prep',
    summary: 'Tourist visa required in advance from an Algerian consulate.',
    notes: ['Invitation or hotel booking typically required'],
  },
  SN: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  NG: {
    difficulty: 'advance-prep',
    summary: 'Tourist visa required — apply online, then embassy processing.',
    notes: ['Requires invitation letter'],
  },
  GH: {
    difficulty: 'moderate',
    summary: 'eVisa available (30 or 60 days); traditional visa also offered.',
    notes: ['Yellow fever vaccination required'],
  },
  ET: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (30 or 90 days).',
  },
  KE: {
    difficulty: 'moderate',
    summary: 'eTA required in advance (~$30, 90 days).',
  },
  TZ: {
    difficulty: 'moderate',
    summary: 'eVisa or visa on arrival (~$100 for U.S. citizens).',
    notes: ['Yellow fever proof if arriving from risk country'],
  },
  UG: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (~$50, 90 days).',
    notes: ['Yellow fever vaccination required'],
  },
  RW: {
    difficulty: 'easy',
    summary: 'Visa on arrival (~$50, 30 days) — quick and reliable.',
    notes: ['Yellow fever proof if arriving from risk country'],
  },
  MG: {
    difficulty: 'moderate',
    summary: 'Visa on arrival or eVisa (~$40, 30 days).',
  },
  MZ: {
    difficulty: 'moderate',
    summary: 'eVisa or visa on arrival (~$50, 30 days).',
  },
  ZW: {
    difficulty: 'moderate',
    summary: 'Visa on arrival ($30 single / $45 double / $75 KAZA).',
  },
  ZA: { difficulty: 'easy', summary: 'Visa-free up to 90 days.', notes: ['Passport must have 2 blank pages'] },
  NA: {
    difficulty: 'moderate',
    summary: 'Visa on arrival required (introduced April 2025, ~$100).',
  },
  BW: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },

  // ── Oceania ──────────────────────────────────────────────────────────────
  AU: {
    difficulty: 'moderate',
    summary: 'ETA / eVisitor required online before travel.',
    notes: ['Approval typically within minutes', 'Valid 1 year, 90 days per stay'],
  },
  NZ: {
    difficulty: 'moderate',
    summary: 'NZeTA required online (~NZ$17 + tourism levy).',
    notes: ['Valid 2 years, up to 90 days per stay'],
  },
  FJ: { difficulty: 'easy', summary: 'Visa-free up to 4 months.' },
  WS: { difficulty: 'easy', summary: '60-day entry permit issued free on arrival.' },
  VU: { difficulty: 'easy', summary: 'Visa-free up to 30 days.' },
  PF: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days (French Polynesia — no ETIAS for direct entry).',
  },

  // ── Additions ────────────────────────────────────────────────────────────
  BS: { difficulty: 'easy', summary: 'Visa-free up to 8 months; passport only.' },
  BB: { difficulty: 'easy', summary: 'Visa-free up to 6 months.' },
  LC: { difficulty: 'easy', summary: 'Visa-free up to 6 weeks; passport only.' },
  AW: {
    difficulty: 'easy',
    summary: 'Visa-free up to 30 days; ED-Card online form required before arrival.',
  },
  PR: {
    difficulty: 'easy',
    summary: 'U.S. territory — no passport needed for U.S. citizens.',
    notes: ['Government-issued photo ID required to fly'],
  },
  TT: { difficulty: 'easy', summary: 'Visa-free up to 90 days.' },
  HK: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days.',
    notes: [PASSPORT_6MO],
  },
  TW: { difficulty: 'easy', summary: 'Visa-free up to 90 days.', notes: [PASSPORT_6MO] },
  MT: schengen(),
  CY: {
    difficulty: 'moderate',
    summary: 'Visa-free up to 90 days now; ETIAS expected once Cyprus joins Schengen.',
    notes: [PASSPORT_3MO_BEYOND_SCHENGEN],
  },
  LU: schengen(),
  EE: schengen(),
  LV: schengen(),
  LT: schengen(),
  BG: schengen(), // Joined Schengen (air/sea) 2024, full 2025
  AL: { difficulty: 'easy', summary: 'Visa-free up to 1 year.' },
  ME: { difficulty: 'easy', summary: 'Visa-free up to 90 days in any 6-month period.' },
  BA: { difficulty: 'easy', summary: 'Visa-free up to 90 days in any 6-month period.' },
  MU: {
    difficulty: 'easy',
    summary: 'Visa-free up to 60 days; Mauritius All-in-One eArrival Card required before travel.',
  },
  SC: {
    difficulty: 'moderate',
    summary: 'Free Travel Authorization required online before boarding.',
    notes: ['Apply at least 72 hours before travel'],
  },

  // ── Additional African countries ─────────────────────────────────────────
  ZM: {
    difficulty: 'moderate',
    summary: 'eVisa or visa-on-arrival ($50 single-entry / $80 KAZA UNIVISA covering Zimbabwe).',
    notes: [PASSPORT_6MO, 'Yellow fever certificate if arriving from an endemic country'],
  },
  MW: {
    difficulty: 'moderate',
    summary: 'eVisa required before travel ($75 single-entry, 30 days).',
    notes: [PASSPORT_6MO, 'At least 1 blank passport page'],
  },
  CI: {
    difficulty: 'moderate',
    summary: 'Pre-approved e-Visa required; collect on arrival at Abidjan airport ($79).',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  CM: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required in advance — no visa on arrival.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required', 'Registration on arrival at some hotels'],
  },
  AO: {
    difficulty: 'easy',
    summary: 'Visa-free for US citizens up to 30 days for tourism.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  CV: {
    difficulty: 'moderate',
    summary: 'Airport Security Tax (TSA) must be paid online before arrival — no visa needed for stays under 30 days.',
    notes: [PASSPORT_6MO],
  },
  GA: {
    difficulty: 'moderate',
    summary: 'e-Visa required before arrival; approval typically within 72 hours.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  ML: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required; State Dept advises against travel due to security conditions.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  BF: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required; State Dept advises against travel due to terrorism and kidnapping risk.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  BJ: {
    difficulty: 'moderate',
    summary: 'e-Visa required before travel (~$50, apply on the official government portal).',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  TG: {
    difficulty: 'moderate',
    summary: 'Visa-on-arrival at Lomé airport (7 days, extendable in-country).',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  LR: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required in advance — no visa on arrival.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  SL: {
    difficulty: 'moderate',
    summary: 'e-Visa required before boarding ($80 single-entry).',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  GM: {
    difficulty: 'easy',
    summary: 'Visa-free for US citizens up to 90 days.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  CD: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required; State Dept advises against travel to eastern provinces.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required', 'Gorilla-trek permits arranged via licensed operators'],
  },
  CG: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required in advance — no visa on arrival.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  LY: {
    difficulty: 'advance-prep',
    summary: 'US passport holders effectively cannot enter — State Dept Level 4 “Do Not Travel”.',
    notes: [PASSPORT_6MO, 'No US embassy services available inside Libya'],
  },
  SD: {
    difficulty: 'advance-prep',
    summary: 'Embassy visa required; State Dept Level 4 “Do Not Travel” due to armed conflict.',
    notes: [PASSPORT_6MO, 'Yellow fever vaccination certificate required'],
  },
  LS: {
    difficulty: 'easy',
    summary: 'Visa-free for US citizens up to 180 days.',
    notes: [PASSPORT_6MO, 'Usually entered overland via South Africa — carry passport for border stamps'],
  },
  SZ: {
    difficulty: 'easy',
    summary: 'Visa-free for US citizens up to 30 days.',
    notes: [PASSPORT_6MO, 'Yellow fever certificate if arriving from an endemic country'],
  },

  // ── Additional additions ─────────────────────────────────────────────────
  AG: {
    difficulty: 'easy',
    summary: 'Visa-free up to 180 days.',
    notes: [PASSPORT_6MO, 'Advance Passenger Information required by airlines'],
  },
  BM: {
    difficulty: 'easy',
    summary: 'Visa-free up to 6 months; passport only.',
    notes: ['Return or onward ticket required'],
  },
  BN: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days.',
    notes: [PASSPORT_6MO],
  },
  DM: {
    difficulty: 'easy',
    summary: 'Visa-free up to 180 days; passport only.',
    notes: [PASSPORT_6MO],
  },
  HT: {
    difficulty: 'moderate',
    summary: 'Visa-free up to 90 days, but State Dept Level 4 “Do Not Travel” due to security conditions.',
    notes: [PASSPORT_6MO, 'Check current advisory before booking — situation changes quickly'],
  },
  KN: {
    difficulty: 'easy',
    summary: 'Visa-free up to 90 days.',
    notes: [PASSPORT_6MO],
  },
  KW: {
    difficulty: 'moderate',
    summary: 'eVisa required in advance (~$3, single entry, 90 days).',
    notes: [PASSPORT_6MO, 'Alcohol is banned nationwide, including in luggage'],
  },
  LB: {
    difficulty: 'advance-prep',
    summary: 'Free 1-month visa on arrival in normal times, but State Dept Level 4 “Do Not Travel”.',
    notes: [PASSPORT_6MO, 'Israeli entry stamps in passport will result in denied entry', 'Check advisory before any travel'],
  },
  MC: {
    difficulty: 'moderate',
    summary: 'Entered via France — Schengen rules apply.',
    notes: [ETIAS_NOTE, PASSPORT_3MO_BEYOND_SCHENGEN],
  },
  VC: {
    difficulty: 'easy',
    summary: 'Visa-free up to 30 days; extendable in-country.',
    notes: [PASSPORT_6MO],
  },
}


