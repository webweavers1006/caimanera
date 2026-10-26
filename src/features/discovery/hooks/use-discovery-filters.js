"use client";

import { useMemo, useState } from "react";
import { DISCOVERY_CONFIG, getSportEmoji } from "../config/discovery.constants";
import { distanceInKm, estimateMinutes, formatDistance } from "../lib/geo";

/**
 * Client-side filtering for the discovery feed.
 * Dataset is intentionally small (next 200 matches), so instant filtering
 * feels better than a server round-trip on every chip.
 */
const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function useDiscoveryFilters(matches = [], location = null) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sport, setSport] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [radius, setRadius] = useState(DISCOVERY_CONFIG.RADIUS.DEFAULT);
  const [sort, setSort] = useState(DISCOVERY_CONFIG.SORT.DEFAULT);

  const enrichedMatches = useMemo(() => {
    return (matches || []).map((match) => {
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
        minutes: estimateMinutes(distanceKm),
      };
    });
  }, [matches, location]);

  // "Distance" is only meaningful once the visitor picked a location.
  // Keep the visible select in sync with the actual sort being applied.
  const effectiveSort = !location && sort === "distance" ? "date" : sort;

  const sports = useMemo(() => {
    const counts = new Map();
    for (const match of matches || []) {
      const key = match.sport || "Otros";
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
      .map(([value, count]) => ({
        value,
        count,
        emoji: getSportEmoji(value),
      }));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const term = normalizeText(searchTerm);
    const numericRadius = radius === "all" ? null : Number(radius);

    const result = enrichedMatches.filter((match) => {
      if (term) {
        const haystack = [
          match.title,
          match.sport,
          match.court?.name,
          match.court?.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!normalizeText(haystack).includes(term)) return false;
      }

      if (sport !== "all" && match.sport !== sport) return false;

      if (dateFilter === "today" && match.daysUntil !== 0) return false;
      if (dateFilter === "tomorrow" && match.daysUntil !== 1) return false;
      if (dateFilter === "week" && (match.daysUntil == null || match.daysUntil < 0 || match.daysUntil > 6)) {
        return false;
      }

      if (numericRadius != null && match.distanceKm != null && match.distanceKm > numericRadius) {
        return false;
      }

      return true;
    });

    const sorted = [...result];
    if (effectiveSort === "price") {
      sorted.sort((a, b) => (a.pricePerSlot ?? 0) - (b.pricePerSlot ?? 0));
    } else if (effectiveSort === "slots") {
      sorted.sort((a, b) => (b.slotsLeft ?? 0) - (a.slotsLeft ?? 0));
    } else if (effectiveSort === "distance" && location) {
      sorted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else {
      sorted.sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }

    return sorted;
  }, [enrichedMatches, searchTerm, sport, dateFilter, radius, effectiveSort, location]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    sport !== "all" ||
    dateFilter !== "all" ||
    radius !== DISCOVERY_CONFIG.RADIUS.DEFAULT;

  const clearFilters = () => {
    setSearchTerm("");
    setSport("all");
    setDateFilter("all");
    setRadius(DISCOVERY_CONFIG.RADIUS.DEFAULT);
    setSort(DISCOVERY_CONFIG.SORT.DEFAULT);
  };

  return {
    filters: {
      searchTerm,
      sport,
      dateFilter,
      radius,
      sort: effectiveSort,
    },
    setters: {
      setSearchTerm,
      setSport,
      setDateFilter,
      setRadius,
      setSort,
    },
    sports,
    enrichedMatches,
    filteredMatches,
    hasActiveFilters,
    clearFilters,
    showAllMatches: () => setRadius("all"),
    distanceEnabled: Boolean(location),
  };
}
