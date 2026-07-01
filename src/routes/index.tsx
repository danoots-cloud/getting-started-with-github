import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WorldMap } from "@/components/WorldMap";
import { CountryPanel } from "@/components/CountryPanel";
import { Flag } from "@/components/Flag";
import { countries } from "@/data/countries";
import type { CountryData } from "@/data/countries";
import { Plane } from "lucide-react";
import logoUrl from "@/assets/logo-nj-to-anywhere.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "From NJ to Anywhere — Plan Your Next Adventure" },
      {
        name: "description",
        content:
          "Interactive world map to discover ideal travel seasons, cultural highlights, climate data, and insider tips for your next trip from New Jersey.",
      },
      {
        property: "og:title",
        content: "From NJ to Anywhere — Plan Your Next Adventure",
      },
      {
        property: "og:description",
        content:
          "Interactive world map to discover ideal travel seasons, cultural highlights, climate data, and insider tips for your next trip from New Jersey.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(
    null
  );
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const handleCountryClick = useCallback(
    (code: string, _name: string) => {
      const data = countries[code];
      if (data) {
        setSelectedCountry(data);
        setSelectedCode(code);
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setSelectedCountry(null);
    setSelectedCode(null);
  }, []);

  const flagColors = selectedCountry?.flagColors ?? null;

  return (
    <div
      className="relative flex min-h-screen flex-col transition-colors duration-700"
      style={{
        backgroundColor: flagColors
          ? `color-mix(in oklch, ${flagColors[0]} 6%, #FBF5EC)`
          : "#FBF5EC",
      }}
    >
      {/* Warm sunset atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% -10%, rgba(242,166,90,0.28) 0%, rgba(251,229,199,0.22) 40%, rgba(255,255,255,0) 70%), radial-gradient(90% 60% at 100% 100%, rgba(232,106,92,0.22) 0%, rgba(255,255,255,0) 60%), radial-gradient(70% 50% at 0% 30%, rgba(30,42,68,0.06) 0%, rgba(255,255,255,0) 65%)",
        }}
      />

      <header className="relative z-10 border-b border-[#1E2A44]/10 bg-[#FBF5EC]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt="From NJ to Anywhere"
              width={1536}
              height={512}
              className="h-10 w-auto sm:h-12"
            />
          </a>
          <div className="flex items-center gap-2 text-sm text-[#1E2A44]/60">
            <Plane className="h-4 w-4 text-[#E86A5C]" />
            <span className="hidden sm:inline">Click a country to explore</span>
          </div>
        </div>
      </header>


      {!selectedCountry && (
        <div className="relative z-10 px-4 pb-2 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="font-display text-2xl font-semibold text-[#1E2A44] sm:text-3xl md:text-4xl">
            Plan your next adventure from{" "}
            <span className="text-[#E86A5C]">New Jersey</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#1E2A44]/65 sm:text-base">
            Select a country to discover ideal travel seasons, cultural
            highlights, climate data, and insider tips.
          </p>
        </div>
      )}

      <div className="relative z-10 flex flex-1">
        <div
          className={`flex-1 transition-all duration-500 ${
            selectedCountry ? "w-1/2" : "w-full"
          }`}
        >
          <div className="mx-auto max-w-6xl px-2 py-4 sm:px-4">
            <div className="overflow-hidden rounded-2xl border border-[#1E2A44]/10 bg-[#FBF5EC]/70 shadow-xl shadow-[#E86A5C]/10 backdrop-blur-sm">
              <WorldMap
                onCountryClick={handleCountryClick}
                selectedCountry={selectedCode}
                flagColors={flagColors}
              />
            </div>

            {!selectedCountry && (
              <div className="mt-6 px-2">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#E86A5C]">
                  Featured Destinations
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Object.values(countries)
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleCountryClick(c.code, c.name)}
                        className="group grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2 rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-3 py-2.5 text-left shadow-sm shadow-[#F2A65A]/15 transition-all hover:-translate-y-0.5 hover:border-[#E86A5C]/40 hover:bg-white hover:shadow-md hover:shadow-[#E86A5C]/20"
                      >
                        <Flag
                          code={c.code}
                          name={c.name}
                          className="h-6 w-9 rounded-sm object-cover shadow ring-1 ring-[#1E2A44]/15"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-[#1E2A44] group-hover:text-[#1E2A44]">
                            {c.name}
                          </div>
                          <div className="truncate text-xs text-[#1E2A44]/50">
                            {c.continent}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {!selectedCountry && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 py-4 text-xs text-[#1E2A44]/65">

                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: "#5B8BD6" }}
                  />
                  Europe
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: "#F0A060" }}
                  />
                  Asia
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: "#6DC47E" }}
                  />
                  Africa
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: "#E06468" }}
                  />
                  N. America
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: "#A08BD6" }}
                  />
                  S. America
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: "#E0D080" }}
                  />
                  Oceania
                </span>
              </div>
            )}
          </div>
        </div>

        {selectedCountry && (
          <div
            className="w-full border-l border-white/70 sm:w-[420px] md:w-[480px] lg:w-[520px]"
            style={{
              backgroundColor: `color-mix(in oklch, ${selectedCountry.flagColors[0]} 7%, #ffffff)`,
            }}
          >
            <div className="sticky top-0 h-screen overflow-hidden">
              <CountryPanel country={selectedCountry} onClose={handleClose} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
