"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/features/shared";
import { DISCOVERY_CONFIG } from "@/features/discovery/config/discovery.constants";
import { formatDistance, orderByDistanceKm } from "@/features/discovery/lib/geo";
import { useDiscoveryLocation } from "@/features/discovery/hooks/use-discovery-location";
import { DiscoveryLocationButton } from "@/features/discovery/components/DiscoveryLocationButton";
import { LocationPickerDialog } from "@/features/discovery/components/LocationPickerDialog";
import { VenueCard } from "./VenueCard";

const labels = DISCOVERY_CONFIG.UI.VENUES;

/**
 * Public venue listing. The location selector orders venues by distance and
 * every card opens `/canchas/[id]`.
 */
export function VenuesView({ venues = [] }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const {
    location,
    recentLocations,
    selectLocation,
    clearRecentLocations,
    locate,
    isLocating,
    geoError,
  } = useDiscoveryLocation();

  const items = useMemo(() => {
    const ordered = location ? orderByDistanceKm(venues, location) : venues;
    return ordered.map((venue) => ({
      ...venue,
      distanceLabel: formatDistance(venue.distanceKm),
    }));
  }, [venues, location]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {labels.EYEBROW}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{labels.TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{labels.SUBTITLE}</p>

        <DiscoveryLocationButton
          location={location}
          onClick={() => setPickerOpen(true)}
          className="mt-4"
        />
      </section>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">{labels.EMPTY_TITLE}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {labels.EMPTY_DESCRIPTION}
          </p>
          <Button asChild className="mt-5 gap-2 rounded-full">
            <Link href={ROUTES.PUBLIC.MATCHES.path}>
              <Trophy data-icon="inline-start" />
              {labels.EMPTY_ACTION}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="text-lg font-bold tracking-tight">
              {DISCOVERY_CONFIG.UI.SECTIONS.VENUES_TITLE}
            </h2>
            <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {labels.COUNT(items.length)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pb-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((venue) => (
              <VenueCard key={venue.id} venue={venue} distanceLabel={venue.distanceLabel} />
            ))}
          </div>
        </>
      )}

      <LocationPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        courts={venues}
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
