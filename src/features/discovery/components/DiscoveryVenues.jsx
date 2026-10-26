"use client";

import { MapPin, Trophy } from "lucide-react";
import { cn } from "@/features/shared";
import { DISCOVERY_CONFIG, getSportEmoji } from "../config/discovery.constants";
import { distanceInKm, formatDistance } from "../lib/geo";

/**
 * Venue mosaic: one large card + smaller tiles, optimized for thumbs.
 */
export function DiscoveryVenues({ courts = [], location, onViewMatches }) {
  const labels = DISCOVERY_CONFIG.UI;

  if (courts.length === 0) return null;

  return (
    <section id="canchas" className="scroll-mt-24 space-y-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">
          {labels.SECTIONS.VENUES_TITLE}
        </h2>
        <p className="text-xs text-muted-foreground">
          {labels.SECTIONS.VENUES_SUBTITLE}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {courts.slice(0, 3).map((court, index) => {
          const km = location
            ? distanceInKm(location, {
                latitude: court.latitude,
                longitude: court.longitude,
              })
            : null;
          const distance = formatDistance(km);
          const featured = index === 0;

          return (
            <button
              key={court.id}
              type="button"
              onClick={() => onViewMatches?.(court)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-border/70 bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                featured
                  ? "col-span-2 aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-square"
                  : "aspect-[4/5] sm:aspect-square"
              )}
            >
              {court.photo ? (
                <img
                  src={court.photo}
                  alt={court.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/5 to-transparent text-4xl">
                  {getSportEmoji(court.sport)}
                </span>
              )}

              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {distance && (
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                  <MapPin className="size-3" />
                  {distance}
                </span>
              )}

              <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                {getSportEmoji(court.sport)} {court.sport}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-3">
                <p
                  className={cn(
                    "truncate font-semibold text-white",
                    featured ? "text-base" : "text-sm"
                  )}
                >
                  {court.name}
                </p>
                {featured && court.address && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">
                    {court.address}
                  </p>
                )}
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                  <Trophy className="size-3" />
                  {court.upcomingMatches > 0
                    ? labels.VENUE.MATCHES(court.upcomingMatches)
                    : labels.VENUE.NO_MATCHES}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
