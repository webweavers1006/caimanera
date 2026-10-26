"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/features/shared";
import { formatPrice } from "@/features/shared/lib/format";
import { VENUE_CONFIG } from "../config/venue.constants";
import { getSportEmoji } from "@/features/shared/lib/sport";
import { distanceInKm, formatDistance } from "@/features/location/lib/geo";
import { useLocation } from "@/features/location/hooks/use-location";
import { MatchesMapWrapper } from "@/features/shared/components/matches/MatchesMapWrapper";
import { PublicMatchCard } from "@/features/shared/components/matches/PublicMatchCard";

const labels = VENUE_CONFIG.UI.LIST;

export function VenueDetailView({ venue }) {
  const { location } = useLocation();

  const distance = useMemo(() => {
    if (!location) return null;
    const km = distanceInKm(location, venue);
    return km == null ? null : formatDistance(km);
  }, [location, venue]);

  const matches = venue.matches || [];
  const cover = venue.photo || venue.photos?.[0] || null;
  const matchesHref = `${ROUTES.PUBLIC.MATCHES.path}?cancha=${venue.id}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
      <Link
        href={ROUTES.PUBLIC.COURTS.path}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {labels.BACK}
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
        <div className="aspect-[16/9] w-full">
          {cover ? (
            <img src={cover} alt={venue.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/30 via-primary/10 to-transparent text-6xl">
              {getSportEmoji(venue.sport)}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {getSportEmoji(venue.sport)} {venue.sport}
        </span>

        {distance && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <MapPin className="size-3" />
            {distance}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {venue.name}
          </h1>
          {venue.address && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-white/75">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {venue.address}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Trophy className="size-3" /> Deporte
          </p>
          <p className="mt-1 text-sm font-semibold">{venue.sport}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Clock3 className="size-3" /> Próximos partidos
          </p>
          <p className="mt-1 text-sm font-semibold">
            {VENUE_CONFIG.UI.DETAIL.MATCHES(venue.upcomingMatches ?? matches.length)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <MapPin className="size-3" /> Distancia
          </p>
          <p className="mt-1 truncate text-sm font-semibold">
            {distance || "Elige tu ubicación"}
          </p>
        </div>
      </section>

      {venue.description && (
        <p className="rounded-2xl border border-border/70 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          {venue.description}
        </p>
      )}

      {venue.hourlyRate > 0 && (
        <p className="text-sm text-muted-foreground">
          Tarifa de referencia:{" "}
          <span className="font-semibold text-foreground">{formatPrice(venue.hourlyRate)}</span>{" "}
          por hora.
        </p>
      )}

      {matches.length > 0 && venue.latitude != null && venue.longitude != null && (
        <MatchesMapWrapper matches={matches} location={location} height={280} />
      )}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight">{labels.DETAIL_MATCHES_TITLE}</h2>
            <p className="text-xs text-muted-foreground">{labels.DETAIL_MATCHES_SUBTITLE}</p>
          </div>
          {matches.length > 0 && (
            <Link
              href={matchesHref}
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              {labels.SEE_MATCHES}
            </Link>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">{labels.NO_MATCHES_TITLE}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {labels.NO_MATCHES_DESCRIPTION}
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href={ROUTES.PUBLIC.MATCHES.path}>{labels.NO_MATCHES_ACTION}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 pb-2">
            {matches.map((match) => (
              <PublicMatchCard
                key={match.id}
                match={match}
                href={`${ROUTES.PUBLIC.MATCHES.path}/${match.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
