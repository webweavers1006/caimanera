"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Map as MapIcon, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, cn } from "@/features/shared";
import { HOME_CONFIG } from "../config/home.constants";
import { orderByDistanceKm, formatDistance } from "@/features/location/lib/geo";
import { useLocation } from "@/features/location/hooks/use-location";
import { LocationButton } from "@/features/location/components/LocationButton";
import { PublicMatchCard } from "@/features/shared/components/matches/PublicMatchCard";
import { LocationPickerDialog } from "@/features/location/components/LocationPickerDialog";
import { VenueCard } from "@/features/venues/components/VenueCard";

const labels = HOME_CONFIG.UI;
const sectionLabels = HOME_CONFIG.SECTIONS;

const SERVICES = [
  {
    key: "matches",
    label: labels.SERVICES.MATCHES,
    href: ROUTES.PUBLIC.MATCHES.path,
    icon: Search,
    featured: true,
  },
  {
    key: "courts",
    label: labels.SERVICES.COURTS,
    href: ROUTES.PUBLIC.COURTS.path,
    icon: MapPin,
  },
  {
    key: "map",
    label: labels.SERVICES.MAP,
    href: `${ROUTES.PUBLIC.MATCHES.path}?vista=mapa`,
    icon: MapIcon,
  },
];

/**
 * Player home. It answers "what is next for me?" and routes every search,
 * venue and map intent to its own page — no embedded match picker here.
 */
export function HomeView({ matches = [], courts = [], userName = null }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    location,
    recentLocations,
    selectLocation,
    clearRecentLocations,
    locate,
    isLocating,
    geoError,
  } = useLocation();

  const sortedCourts = useMemo(() => {
    const ordered = location ? orderByDistanceKm(courts, location) : courts;
    return ordered.map((court) => ({
      ...court,
      distanceLabel: formatDistance(court.distanceKm),
    }));
  }, [courts, location]);

  const nextMatch = matches[0] || null;
  const upcomingMatches = matches.slice(1, 3);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {labels.GREETING(userName)}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {labels.TITLE}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              {labels.SUBTITLE}
            </p>
          </div>

          <LocationButton
            location={location}
            onClick={() => setPickerOpen(true)}
            className="lg:w-80 lg:shrink-0"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 px-1">
          <h2 className="text-lg font-bold tracking-tight">{labels.ACTIONS_TITLE}</h2>
          <p className="text-xs text-muted-foreground">{labels.ACTIONS_SUBTITLE}</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.key}
                href={service.href}
                className={cn(
                  "group flex min-h-[104px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/70 bg-background/60 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  service.featured && "border-primary/30 bg-primary/10"
                )}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20",
                    service.featured && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-[11px] font-semibold leading-tight">
                  {service.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight">{labels.NEXT_MATCH_TITLE}</h2>
            <p className="text-xs text-muted-foreground">{labels.NEXT_MATCH_SUBTITLE}</p>
          </div>
          {nextMatch && (
            <Link
              href={ROUTES.PLAYER.MY_MATCHES.path}
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              {labels.VIEW_ALL}
            </Link>
          )}
        </div>

        {nextMatch ? (
          <PublicMatchCard
            match={nextMatch}
            href={`${ROUTES.PUBLIC.MATCHES.path}/${nextMatch.id}`}
          />
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-10 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarCheck className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">{labels.EMPTY_TITLE}</h3>
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
        )}
      </section>

      {upcomingMatches.length > 0 && (
        <section className="space-y-2.5">
          <div className="px-1">
            <h2 className="text-lg font-bold tracking-tight">{labels.UPCOMING_TITLE}</h2>
            <p className="text-xs text-muted-foreground">{labels.UPCOMING_SUBTITLE}</p>
          </div>

          {upcomingMatches.map((match) => (
            <PublicMatchCard
              key={match.id}
              match={match}
              href={`${ROUTES.PUBLIC.MATCHES.path}/${match.id}`}
            />
          ))}

          <Button asChild variant="secondary" className="w-full gap-2 rounded-full">
            <Link href={ROUTES.PLAYER.MY_MATCHES.path}>
              {labels.VIEW_ALL}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </section>
      )}

      {sortedCourts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-1">
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight">
                {sectionLabels.VENUES_TITLE}
              </h2>
              <p className="text-xs text-muted-foreground">{sectionLabels.VENUES_SUBTITLE}</p>
            </div>
            <Link
              href={ROUTES.PUBLIC.COURTS.path}
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              {labels.VENUES_VIEW_ALL}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {sortedCourts.slice(0, 3).map((court) => (
              <VenueCard
                key={court.id}
                venue={court}
                distanceLabel={court.distanceLabel}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      <LocationPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        courts={courts}
        recentLocations={recentLocations}
        onSelect={selectLocation}
        onLocate={locate}
        onClearRecents={clearRecentLocations}
        isLocating={isLocating}
        geoError={geoError}
      />
    </div>
  );
}
