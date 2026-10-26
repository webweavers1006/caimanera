"use client";

import { MatchCard } from "@/features/matches/components/MatchCard";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";
import { DiscoveryEmpty } from "./DiscoveryEmpty";
import { DiscoveryMapWrapper } from "./DiscoveryMapWrapper";

/**
 * Result section: cards list or map view, with contextual empty states.
 */
export function DiscoveryResults({
  matches,
  location,
  view,
  hasFilters,
  clearFilters,
  expandRadius,
  isAuthenticated,
  loginPath = DISCOVERY_CONFIG.PATHS.HOME,
}) {
  const labels = DISCOVERY_CONFIG.UI;

  return (
    <section id="partidos" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {location ? labels.SECTIONS.MATCHES_TITLE : labels.SECTIONS.MATCHES_TITLE_ALL}
          </h2>
          <p className="text-sm text-muted-foreground">
            {labels.SECTIONS.MATCHES_SUBTITLE(matches.length)}
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <DiscoveryEmpty
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onExpandRadius={expandRadius}
        />
      ) : view === "map" ? (
        <DiscoveryMapWrapper matches={matches} location={location} height={560} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isAuthenticated={isAuthenticated}
              loginPath={loginPath}
              detailPath={`${DISCOVERY_CONFIG.PATHS.MATCHES}/${match.id}`}
              showManagement={false}
              distanceLabel={match.distanceLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
