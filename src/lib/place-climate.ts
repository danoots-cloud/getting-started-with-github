// Small helpers for summarizing a place's climate in one line.

export interface MonthTemp {
  month: string
  high: number
  low: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthLabel(i: number): string {
  return MONTHS[((i % 12) + 12) % 12]
}

/**
 * Turns a 12-month temperature + precipitation series into a short line like
 *   "Most pleasant temps: Apr–Jun · Wettest Dec–Mar"
 * Returns null if we don't have both series in the expected shape.
 */
export function climateGlance(
  temperatures: MonthTemp[] | undefined,
  precipitation: number[] | undefined
): string | null {
  if (!temperatures?.length) return null

  // Pleasant = average daily temp (high+low)/2 between 60°F and 80°F
  const pleasant = temperatures.map((t, i) => {
    const avg = (t.high + t.low) / 2
    const isPleasant = avg >= 60 && avg <= 80
    return { month: i, avg, isPleasant }
  })

  // Find the longest contiguous run of pleasant months (wrapping allowed).
  // Duplicate the array to handle wrapping easily.
  const doubled = [...pleasant, ...pleasant]
  let bestStart = 0
  let bestLen = 0
  let bestScore = -Infinity

  for (let i = 0; i < 12; i++) {
    let len = 0
    let score = 0
    for (let j = i; j < i + 12; j++) {
      if (!doubled[j].isPleasant) break
      len++
      score += 80 - Math.abs(doubled[j].avg - 70) // closer to 70°F is better
    }
    if (len > bestLen || (len === bestLen && score > bestScore)) {
      bestLen = len
      bestScore = score
      bestStart = i
    }
  }

  let tempPart: string
  if (bestLen === 12) {
    tempPart = 'Most pleasant temps: Year-round'
  } else if (bestLen >= 2) {
    tempPart = `Most pleasant temps: ${monthLabel(bestStart)}–${monthLabel(bestStart + bestLen - 1)}`
  } else if (bestLen === 1) {
    tempPart = `Most pleasant temps: ${monthLabel(bestStart)}`
  } else {
    // No pleasant months — pick the 3-month window closest to the pleasant range
    let closestStart = 0
    let closestDist = Infinity
    for (let i = 0; i < 12; i++) {
      let dist = 0
      for (let j = 0; j < 3; j++) {
        const idx = (i + j) % 12
        const avg = pleasant[idx].avg
        if (avg < 60) dist += 60 - avg
        else if (avg > 80) dist += avg - 80
      }
      if (dist < closestDist) {
        closestDist = dist
        closestStart = i
      }
    }
    tempPart = `Most pleasant temps: ${monthLabel(closestStart)}–${monthLabel(closestStart + 2)}`
  }

  let rainPart = ''
  if (precipitation && precipitation.length === 12) {
    // Find the 3-month rolling window with the highest total rainfall.
    let bestRainStart = 0
    let bestRainSum = -Infinity
    for (let i = 0; i < 12; i++) {
      const sum = precipitation[i] + precipitation[(i + 1) % 12] + precipitation[(i + 2) % 12]
      if (sum > bestRainSum) {
        bestRainSum = sum
        bestRainStart = i
      }
    }
    // Only flag a wet season if it's meaningfully wetter than average.
    const annual = precipitation.reduce((s, v) => s + v, 0)
    const avgQuarter = annual * (3 / 12)
    if (bestRainSum > avgQuarter * 1.35) {
      rainPart = ` · Wettest ${monthLabel(bestRainStart)}–${monthLabel(bestRainStart + 2)}`
    } else if (annual < 300) {
      rainPart = ' · Dry year-round'
    }
  }

  return `${tempPart}${rainPart}`
}
