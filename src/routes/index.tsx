import { useState, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { WorldMap } from "@/components/WorldMap";
import { CountryPanel } from "@/components/CountryPanel";
import { Flag } from "@/components/Flag";
import { RecommendationFilters } from "@/components/RecommendationFilters";
import { countries } from "@/data/countries";
import type { CountryData } from "@/data/countries";
import { Plane, Sparkles } from "lucide-react";
import logoUrl from "@/assets/logo-nj-to-anywhere.png";
import { getTravelAdvisories } from "@/lib/advisories.functions";
import {
  getDestinationRecommendations,
  MONTH_NAMES,
  type RecommendationFilters as Filters,
  type DestinationRecommendation,
} from "@/lib/destinationRecommendations";

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
  loader: ({ context }) => {
    context.queryClient.prefetchQuery({
      queryKey: ["travel-advisories"],
      queryFn: () => getTravelAdvisories(),
      staleTime: 6 * 60 * 60 * 1000,
    });
  },
  component: Home,
});

function Home() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(
    null
  );
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const [recoActive, setRecoActive] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    month: new Date().getMonth() + 1,
    maxFlightHours: 8,
    advisoryPreference: "levels-1-2",
  });

  const fetchAdvisories = useServerFn(getTravelAdvisories);
  const advisoriesQuery = useQuery({
    queryKey: ["travel-advisories"],
    queryFn: () => fetchAdvisories(),
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  });

  const recommendations: DestinationRecommendation[] = useMemo(() => {
    if (!recoActive) return [];
    return getDestinationRecommendations(filters, advisoriesQuery.data);
  }, [recoActive, filters, advisoriesQuery.data]);

  const eligibleCountries = useMemo(() => {
    if (!recoActive) return null;
    return new Set(recommendations.map((r) => r.countryCode));
  }, [recoActive, recommendations]);

  const recoByCode = useMemo(() => {
    const m = new Map<string, DestinationRecommendation>();
    for (const r of recommendations) m.set(r.countryCode, r);
    return m;
  }, [recommendations]);

  const handleCountryClick = useCallback(
    (code: string, _name: string) => {
      if (recoActive && !recoByCode.has(code)) return;
      const data = countries[code];
      if (data) {
        setSelectedCountry(data);
        setSelectedCode(code);
      }
    },
    [recoActive, recoByCode]
  );

  const handleClose = useCallback(() => {
    setSelectedCountry(null);
    setSelectedCode(null);
  }, []);

  const clearReco = useCallback(() => {
    setRecoActive(false);
  }, []);

  const flagColors = selectedCountry?.flagColors ?? null;
  const monthName = MONTH_NAMES[filters.month - 1];

  const selectedReco = selectedCode ? recoByCode.get(selectedCode) : undefined;

  return (
    <div
      className="relative flex min-h-screen flex-col transition-colors duration-700"
      style={{
        backgroundColor: flagColors
          ? `color-mix(in oklch, ${flagColors[0]} 6%, #FBF5EC)`
          : "#FBF5EC",
      }}
    >
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
            <span className="hidden sm:inline">
              {recoActive ? "Recommendation mode" : "Click a country to explore"}
            </span>
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
            {!selectedCountry && (
              <div className="mb-4 px-2">
                <RecommendationFilters
                  filters={filters}
                  onChange={(next) => {
                    if (recoActive) clearReco();
                    setFilters(next);
                  }}
                  active={recoActive}
                  onActivate={() => setRecoActive(true)}
                  onClear={clearReco}
                  resultCount={recoActive ? recommendations.length : null}
                  advisoriesLoading={advisoriesQuery.isLoading}
                />
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-[#1E2A44]/10 bg-[#FBF5EC]/70 shadow-xl shadow-[#E86A5C]/10 backdrop-blur-sm">
              <WorldMap
                onCountryClick={handleCountryClick}
                selectedCountry={selectedCode}
                flagColors={flagColors}
                eligibleCountries={eligibleCountries}
              />
            </div>

            {!selectedCountry && recoActive && (
              <div className="mt-6 px-2">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#E86A5C]">
                  <Sparkles className="h-4 w-4" />
                  Recommended destinations · {monthName}
                </h3>
                {recommendations.length === 0 ? (
                  <p className="rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-4 py-6 text-center text-sm text-[#1E2A44]/70">
                    {advisoriesQuery.isLoading
                      ? "Loading travel advisories…"
                      : "No destinations match these filters. Try widening flight time or including Level 3."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {recommendations.map((r) => (
                      <button
                        key={r.countryCode}
                        onClick={() => handleCountryClick(r.countryCode, r.country.name)}
                        className="group grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/85 px-3 py-3 text-left shadow-sm shadow-[#F2A65A]/15 transition-all hover:-translate-y-0.5 hover:border-[#E86A5C]/40 hover:bg-white hover:shadow-md"
                      >
                        <Flag
                          code={r.countryCode}
                          name={r.country.name}
                          className="mt-0.5 h-6 w-9 rounded-sm object-cover shadow ring-1 ring-[#1E2A44]/15"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-[#1E2A44]">
                              {r.country.name}
                            </span>
                            <span className="rounded-full bg-[#E86A5C]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c74a3d]">
                              {r.publicLabel}
                            </span>
                          </div>
                          {r.leadPlace && (
                            <div className="mt-0.5 truncate text-xs text-[#1E2A44]/70">
                              Lead: {r.leadPlace.name}
                            </div>
                          )}
                          <div className="mt-0.5 truncate text-xs text-[#1E2A44]/50">
                            {r.country.flightTimeFromEWR}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!selectedCountry && !recoActive && (
              <div className="mt-6 px-2">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#E86A5C]">
                  Featured Destinations
                </h3>
                {(() => {
                  const byContinent: Record<string, CountryData[]> = {};
                  for (const c of Object.values(countries)) {
                    const parts = c.continent.split("/").map((p) => p.trim());
                    for (const p of parts) {
                      (byContinent[p] ||= []).push(c);
                    }
                  }
                  const continentNames = Object.keys(byContinent).sort();
                  return (
                    <div className="space-y-6">
                      {continentNames.map((cont) => (
                        <div key={cont}>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1E2A44]/60">
                            {cont}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {byContinent[cont]
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
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {selectedCountry && (
          <div
            className="w-full border-l border-[#1E2A44]/10 sm:w-[420px] md:w-[480px] lg:w-[520px]"
            style={{
              backgroundColor: `color-mix(in oklch, ${selectedCountry.flagColors[0]} 6%, #FBF5EC)`,
            }}
          >
            <div className="sticky top-0 h-screen overflow-hidden">
              <CountryPanel
                country={selectedCountry}
                onClose={handleClose}
                recommendedPlaceName={
                  recoActive ? selectedReco?.leadPlace?.name ?? null : null
                }
                recommendationMonthName={recoActive ? monthName : null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
