"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MATCH_SEARCH_CONFIG } from "../config/match-search.constants";
import { getSportEmoji } from "@/features/shared/lib/sport";
import { distanceInKm, estimateMinutes, formatDistance } from "@/features/location/lib/geo";

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const DATE_VALUES = new Set(MATCH_SEARCH_CONFIG.DATE_FILTERS.map((option) => option.value));
const SORT_VALUES = new Set(MATCH_SEARCH_CONFIG.SORT.OPTIONS.map((option) => option.value));
const RADIUS_VALUES = new Set(MATCH_SEARCH_CONFIG.RADIUS.OPTIONS.map((option) => String(option.value)));

/**
 * Match search filters backed by the URL.
 *
 * The URL is the source of truth: `deporte`, `dia`, `radio`, `orden`, `vista`,
 * `lat`, `lng`, `cancha` and the optional `q` text survive reloads and can be
 * shared. Filtering itself stays client-side over the small public dataset.
 */
export function useMatchSearchFilters(matches = [], location = null) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearchTerm = searchParams.get("q") || "";
  const [searchTerm, setSearchTermState] = useState(urlSearchTerm);
  const [lastUrlSearchTerm, setLastUrlSearchTerm] = useState(urlSearchTerm);
  const searchTimer = useRef(null);

  // Adjust local draft when the URL changes from outside this input
  // (back/forward, clear filters, shared links) without an effect.
  if (urlSearchTerm !== lastUrlSearchTerm) {
    setLastUrlSearchTerm(urlSearchTerm);
    setSearchTermState(urlSearchTerm);
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const updateParams = (mutate) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setParam = (key, value, defaultValue = null) => {
    updateParams((next) => {
      if (
        value == null ||
        value === "" ||
        (defaultValue != null && String(value) === String(defaultValue))
      ) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
  };

  const setSearchTerm = (value) => {
    setSearchTermState(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setParam("q", value.trim());
    }, 350);
  };

  const setSport = (value) => setParam("deporte", value, "all");
  const setDateFilter = (value) => setParam("dia", value, "all");
  const setRadius = (value) => setParam("radio", value, MATCH_SEARCH_CONFIG.RADIUS.DEFAULT);
  const setSort = (value) => setParam("orden", value, MATCH_SEARCH_CONFIG.SORT.DEFAULT);
  const setView = (value) =>
    setParam("vista", value === MATCH_SEARCH_CONFIG.VIEW.MAP ? "mapa" : null);
  const setCourtFilter = (courtId) => setParam("cancha", courtId);

  const sport = searchParams.get("deporte") || "all";
  const dateFilterRaw = searchParams.get("dia") || "all";
  const dateFilter = DATE_VALUES.has(dateFilterRaw) ? dateFilterRaw : "all";

  const radiusRaw = searchParams.get("radio");
  const radius =
    radiusRaw === "all"
      ? "all"
      : radiusRaw && RADIUS_VALUES.has(radiusRaw)
        ? Number(radiusRaw)
        : MATCH_SEARCH_CONFIG.RADIUS.DEFAULT;

  const sortRaw = searchParams.get("orden") || MATCH_SEARCH_CONFIG.SORT.DEFAULT;
  const sort = SORT_VALUES.has(sortRaw) ? sortRaw : MATCH_SEARCH_CONFIG.SORT.DEFAULT;

  const viewRaw = searchParams.get("vista");
  const view =
    viewRaw === "mapa" || viewRaw === "map" ? MATCH_SEARCH_CONFIG.VIEW.MAP : MATCH_SEARCH_CONFIG.VIEW.LIST;

  const courtId = searchParams.get("cancha") || null;

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
          .join(" ");
        if (!normalizeText(haystack).includes(term)) return false;
      }

      if (sport !== "all" && match.sport !== sport) return false;
      if (courtId && match.court?.id !== courtId) return false;

      if (dateFilter === "today" && match.daysUntil !== 0) return false;
      if (dateFilter === "tomorrow" && match.daysUntil !== 1) return false;
      if (
        dateFilter === "week" &&
        (match.daysUntil == null || match.daysUntil < 0 || match.daysUntil > 6)
      ) {
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
  }, [enrichedMatches, searchTerm, sport, dateFilter, radius, effectiveSort, location, courtId]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    sport !== "all" ||
    dateFilter !== "all" ||
    radius !== MATCH_SEARCH_CONFIG.RADIUS.DEFAULT ||
    Boolean(courtId);

  const clearFilters = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSearchTermState("");
    updateParams((next) => {
      ["q", "deporte", "dia", "radio", "orden", "cancha"].forEach((key) => next.delete(key));
    });
  };

  return {
    filters: {
      searchTerm,
      sport,
      dateFilter,
      radius,
      sort: effectiveSort,
      view,
      courtId,
    },
    setters: {
      setSearchTerm,
      setSport,
      setDateFilter,
      setRadius,
      setSort,
      setView,
      setCourtFilter,
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
