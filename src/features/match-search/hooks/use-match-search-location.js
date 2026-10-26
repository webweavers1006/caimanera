"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDiscoveryLocation } from "@/features/discovery/hooks/use-discovery-location";
import { normalizeLocation } from "@/features/discovery/lib/geo";

function readNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Location for the match search. The URL location wins over the persistent one
 * so a shared link reproduces the same radius around the same point.
 */
export function useMatchSearchLocation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    location: storedLocation,
    recentLocations,
    selectLocation: persistLocation,
    clearRecentLocations,
    locate: locateStored,
    isLocating,
    geoError,
    clearGeoError,
  } = useDiscoveryLocation();

  const lat = readNumber(searchParams.get("lat"));
  const lng = readNumber(searchParams.get("lng"));

  const location = useMemo(() => {
    if (lat == null || lng == null) return storedLocation;
    return {
      label: searchParams.get("ubicacion") || "Mi ubicación",
      latitude: lat,
      longitude: lng,
      source: "url",
    };
  }, [lat, lng, searchParams, storedLocation]);

  const writeLocationToUrl = useCallback(
    (nextLocation) => {
      const normalized = normalizeLocation(nextLocation);
      if (!normalized) return;

      const next = new URLSearchParams(searchParams.toString());
      next.set("lat", normalized.latitude.toFixed(6));
      next.set("lng", normalized.longitude.toFixed(6));
      next.set("ubicacion", normalized.label);
      // A specific venue filter no longer makes sense after moving the center.
      next.delete("cancha");

      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const selectLocation = useCallback(
    (nextLocation) => {
      persistLocation(nextLocation);
      writeLocationToUrl(nextLocation);
    },
    [persistLocation, writeLocationToUrl]
  );

  const locate = useCallback(async () => {
    const nextLocation = await locateStored();
    if (nextLocation) writeLocationToUrl(nextLocation);
    return nextLocation;
  }, [locateStored, writeLocationToUrl]);

  return {
    location,
    recentLocations,
    selectLocation,
    clearRecentLocations,
    locate,
    isLocating,
    geoError,
    clearGeoError,
  };
}
