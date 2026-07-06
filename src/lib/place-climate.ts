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
 *   "Avg high 82°F · Wettest Dec–Mar"
 * Returns null if we don't have both series in the expected shape.
 */
export function climateGlance(
  temperatures: MonthTemp[] | undefined,
  precipitation: number[] | undefined
): string | null {
  if (!temperatures?.length) return null

  const meanHigh = Math.round(
    temperatures.reduce((s, t) => s + t.high, 0) / temperatures.length
  )

  let rainPart = ''
  if (precipitation && precipitation.length === 12) {
    // Find the 3-month rolling window with the highest total rainfall.
    let bestStart = 0
    let bestSum = -Infinity
    for (let i = 0; i < 12; i++) {
      const sum = precipitation[i] + precipitation[(i + 1) % 12] + precipitation[(i + 2) % 12]
      if (sum > bestSum) {
        bestSum = sum
        bestStart = i
      }
    }
    // Only flag a wet season if it's meaningfully wetter than average.
    const annual = precipitation.reduce((s, v) => s + v, 0)
    const avgQuarter = annual * (3 / 12)
    if (bestSum > avgQuarter * 1.35) {
      rainPart = ` · Wettest ${monthLabel(bestStart)}–${monthLabel(bestStart + 2)}`
    } else if (annual < 300) {
      rainPart = ' · Dry year-round'
    }
  }

  return `Avg high ${meanHigh}°F${rainPart}`
}
