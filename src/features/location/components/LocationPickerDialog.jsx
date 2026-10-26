"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock3,
  LocateFixed,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOCATION_CONFIG } from "../config/location.constants";

function ResultRow({ icon: Icon, title, subtitle, onClick, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle && (
          <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {badge && (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

/**
 * Location picker modeled after consumer delivery apps: current location,
 * address search, recent locations, popular zones and nearby venues.
 */
export function LocationPickerDialog({
  open,
  onOpenChange,
  courts = [],
  recentLocations = [],
  onSelect,
  onLocate,
  onClearRecents,
  isLocating = false,
  geoError = null,
}) {
  const labels = LOCATION_CONFIG.UI;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const close = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    setQuery("");
    setResults([]);
    setSearchError(null);
    setIsSearching(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const runSearch = useCallback(async (value) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(`/api/geo/search?q=${encodeURIComponent(value)}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("search failed");
      const data = await response.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      if (error?.name !== "AbortError") {
        setResults([]);
        setSearchError(labels.ADDRESS_ERROR);
      }
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }, [labels.ADDRESS_ERROR]);

  const handleQueryChange = (value) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (value.trim().length < 3) {
      abortRef.current?.abort();
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    timerRef.current = setTimeout(() => runSearch(value.trim()), 450);
  };

  const handleSelect = (location) => {
    onSelect(location);
    close();
  };

  const handleLocate = async () => {
    const location = await onLocate();
    if (location) close();
  };

  const normalizedQuery = query.trim().toLowerCase();
  const matchingCourts = normalizedQuery
    ? courts.filter((court) =>
        [court.name, court.address, court.sport]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : courts;

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{labels.DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden">
          <Button
            type="button"
            variant="secondary"
            className="h-11 w-full justify-start gap-3"
            onClick={handleLocate}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <LocateFixed className="size-4 text-primary" />
            )}
            {isLocating ? labels.LOCATING : labels.LOCATE}
          </Button>

          {geoError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {geoError}
            </p>
          )}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder={labels.ADDRESS_PLACEHOLDER}
              aria-label={labels.ADDRESS_SEARCH}
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {query.trim().length > 0 && query.trim().length < 3 && (
              <p className="px-3 text-xs text-muted-foreground">{labels.ADDRESS_EMPTY}</p>
            )}

            {isSearching && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Buscando direcciones…
              </div>
            )}

            {searchError && (
              <p className="px-3 text-xs text-destructive">{searchError}</p>
            )}

            {results.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Direcciones
                </p>
                {results.map((result) => (
                  <ResultRow
                    key={`${result.latitude}-${result.longitude}-${result.label}`}
                    icon={MapPin}
                    title={result.label}
                    subtitle={result.subtitle}
                    onClick={() =>
                      handleSelect({
                        label: result.label,
                        latitude: result.latitude,
                        longitude: result.longitude,
                        source: "address",
                      })
                    }
                  />
                ))}
              </div>
            )}

            {query.trim().length === 0 && recentLocations.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.RECENTS}
                  </p>
                  <button
                    type="button"
                    onClick={onClearRecents}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Limpiar
                  </button>
                </div>
                {recentLocations.map((item, index) => (
                  <ResultRow
                    key={`${item.label}-${index}`}
                    icon={Clock3}
                    title={item.label}
                    onClick={() => handleSelect(item)}
                  />
                ))}
              </div>
            )}

            {matchingCourts.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {labels.VENUES}
                </p>
                {matchingCourts.slice(0, 6).map((court) => (
                  <ResultRow
                    key={court.id}
                    icon={MapPin}
                    title={court.name}
                    subtitle={court.address || court.sport}
                    badge={court.sport}
                    onClick={() =>
                      handleSelect({
                        label: court.name,
                        latitude: court.latitude,
                        longitude: court.longitude,
                        source: "venue",
                      })
                    }
                  />
                ))}
              </div>
            )}

            {query.trim().length === 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {labels.POPULAR}
                </p>
                {LOCATION_CONFIG.ZONES.map((zone) => (
                  <ResultRow
                    key={zone.label}
                    icon={MapPin}
                    title={zone.label}
                    onClick={() =>
                      handleSelect({
                        label: zone.label,
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                        source: "zone",
                      })
                    }
                  />
                ))}
              </div>
            )}

            {query.trim().length >= 3 &&
              !isSearching &&
              results.length === 0 &&
              matchingCourts.length === 0 &&
              !searchError && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {labels.ADDRESS_NO_RESULTS}
                </p>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
