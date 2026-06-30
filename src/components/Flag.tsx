interface FlagProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "CA", "NL"). */
  code: string
  /** Country name, used for the image alt text. */
  name: string
  className?: string
}

/**
 * Renders a real country flag image instead of a flag emoji.
 *
 * Flag emoji rely on regional-indicator glyphs that many desktop browsers
 * (notably Chrome/Edge on Windows) do not render, falling back to the bare
 * two-letter country code. Using an SVG image keyed by ISO alpha-2 code shows
 * an actual flag consistently on both desktop and mobile.
 */
export function Flag({ code, name, className }: FlagProps) {
  const cc = code.toLowerCase()
  return (
    <img
      src={`https://flagcdn.com/${cc}.svg`}
      alt={`Flag of ${name}`}
      loading="lazy"
      width={60}
      height={40}
      className={className}
    />
  )
}
