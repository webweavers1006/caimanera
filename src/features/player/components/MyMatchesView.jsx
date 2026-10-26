"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/features/shared";
import { PLAYER_CONFIG } from "../config/player.constants";
import { distanceInKm, formatDistance } from "@/features/location/lib/geo";
import { useLocation } from "@/features/location/hooks/use-location";
import { PublicMatchCard } from "@/features/shared/components/matches/PublicMatchCard";
import { MatchCheckoutSheet } from "@/features/booking/components/MatchCheckoutSheet";

/**
 * Public "Mis partidos" list: only the player's upcoming enrollments.
 * Reuses the public match card and checkout sheet so managing a booking feels
 * identical to joining one, without entering the admin panel.
 */
export function MyMatchesView({ matches = [] }) {
  const labels = PLAYER_CONFIG.MY_MATCHES;
  const { location } = useLocation();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const items = useMemo(
    () =>
      (matches || []).map((match) => {
        const distanceKm = location
          ? distanceInKm(location, {
              latitude: match.court?.latitude,
              longitude: match.court?.longitude,
            })
          : null;

        return {
          ...match,
          distanceKm,
          distanceLabel: formatDistance(distanceKm),
        };
      }),
    [matches, location]
  );

  const handleOpenMatch = (match) => {
    setSelectedMatch(match);
    setCheckoutOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {labels.EYEBROW}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{labels.TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{labels.SUBTITLE}</p>
        </div>
        {items.length > 0 && (
          <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            {labels.COUNT(items.length)}
          </span>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">{labels.EMPTY_TITLE}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {labels.EMPTY_DESCRIPTION}
          </p>
          <Button asChild className="mt-5 gap-2 rounded-full">
            <Link href={ROUTES.PUBLIC.MATCHES.path}>
              <Search data-icon="inline-start" />
              {labels.EMPTY_ACTION}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5 pb-2">
          {items.map((match) => (
            <PublicMatchCard
              key={match.id}
              match={match}
              onClick={() => handleOpenMatch(match)}
            />
          ))}
          <p className="px-2 pt-1 text-center text-[11px] text-muted-foreground">
            {labels.HINT}
          </p>
        </div>
      )}

      <MatchCheckoutSheet
        match={selectedMatch}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        isAuthenticated
        nextPath={ROUTES.PLAYER.MY_MATCHES.path}
      />
    </div>
  );
}
