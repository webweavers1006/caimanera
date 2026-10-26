"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";
import { normalizeLocation } from "../lib/geo";

const LOCATION_EVENT = "caimanera:location-changed";
const RECENTS_EVENT = "caimanera:recents-changed";
const EMPTY = "";

function emit(name) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
}

function readStorage(key) {
  if (typeof window === "undefined") return EMPTY;
  try {
    return window.localStorage.getItem(key) || EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // Storage can be blocked (private mode). The app keeps working in memory.
  }
}

/**
 * Exposes the selected discovery location and the recent locations list.
 * Persisted in localStorage and shared across components via custom events.
 */
export function useDiscoveryLocation() {
  const locationRaw = useSyncExternalStore(
    (callback) => {
      window.addEventListener(LOCATION_EVENT, callback);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(LOCATION_EVENT, callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => readStorage(DISCOVERY_CONFIG.STORAGE.LOCATION),
    () => EMPTY
  );

  const recentsRaw = useSyncExternalStore(
    (callback) => {
      window.addEventListener(RECENTS_EVENT, callback);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(RECENTS_EVENT, callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => readStorage(DISCOVERY_CONFIG.STORAGE.RECENTS),
    () => EMPTY
  );

  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const location = useMemo(() => {
    if (!locationRaw) return null;
    try {
      return normalizeLocation(JSON.parse(locationRaw));
    } catch {
      return null;
    }
  }, [locationRaw]);

  const recentLocations = useMemo(() => {
    if (!recentsRaw) return [];
    try {
      const parsed = JSON.parse(recentsRaw);
      return Array.isArray(parsed)
        ? parsed.map(normalizeLocation).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }, [recentsRaw]);

  const selectLocation = useCallback((nextLocation) => {
    const normalized = normalizeLocation(nextLocation);
    if (!normalized) return;
    setGeoError(null);

    writeStorage(DISCOVERY_CONFIG.STORAGE.LOCATION, JSON.stringify(normalized));
    emit(LOCATION_EVENT);

    const entry = {
      ...normalized,
      savedAt: new Date().toISOString(),
    };

    const current = (() => {
      try {
        const parsed = JSON.parse(readStorage(DISCOVERY_CONFIG.STORAGE.RECENTS) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const deduped = current.filter((item) => {
      const sameLabel = item.label === entry.label;
      const samePoint =
        Math.abs(Number(item.latitude) - entry.latitude) < 0.0001 &&
        Math.abs(Number(item.longitude) - entry.longitude) < 0.0001;
      return !sameLabel && !samePoint;
    });

    writeStorage(
      DISCOVERY_CONFIG.STORAGE.RECENTS,
      JSON.stringify([entry, ...deduped].slice(0, DISCOVERY_CONFIG.MAX_RECENTS))
    );
    emit(RECENTS_EVENT);
  }, []);

  const clearRecentLocations = useCallback(() => {
    writeStorage(DISCOVERY_CONFIG.STORAGE.RECENTS, "");
    emit(RECENTS_EVENT);
  }, []);

  const locate = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoError("Tu navegador no permite obtener la ubicación.");
      return null;
    }

    setIsLocating(true);
    setGeoError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12_000,
          maximumAge: 300_000,
        });
      });

      const nextLocation = {
        label: "Mi ubicación actual",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: "gps",
      };

      // Reverse geocoding is a nice-to-have: never block selection on it.
      try {
        const response = await fetch(
          `/api/geo/reverse?lat=${nextLocation.latitude}&lng=${nextLocation.longitude}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.label) nextLocation.label = data.label;
        }
      } catch {
        // Keep the generic label.
      }

      selectLocation(nextLocation);
      return nextLocation;
    } catch (error) {
      const denied = error?.code === 1;
      setGeoError(
        denied
          ? "Bloqueaste el acceso a tu ubicación. Puedes buscar una dirección o elegir una zona."
          : "No pudimos obtener tu ubicación. Intenta de nuevo o elige una zona."
      );
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [selectLocation]);

  return {
    location,
    recentLocations,
    selectLocation,
    clearRecentLocations,
    locate,
    isLocating,
    geoError,
    clearGeoError: () => setGeoError(null),
  };
}
