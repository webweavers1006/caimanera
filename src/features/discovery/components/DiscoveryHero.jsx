"use client";

import { ChevronDown, LocateFixed, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

/**
 * Consumer-style hero with the location selector as the primary action.
 */
export function DiscoveryHero({
  location,
  onOpenLocationPicker,
  searchTerm,
  onSearchChange,
  matchCount,
  courtCount,
  sportsCount,
}) {
  const labels = DISCOVERY_CONFIG.UI.HERO;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.38_0.12_158)] via-primary to-[oklch(0.26_0.07_165)] p-6 text-primary-foreground shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex flex-col gap-6">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="size-3.5" />
            {labels.EYEBROW}
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {labels.TITLE}
          </h1>
          <p className="max-w-xl text-sm text-white/80 sm:text-base">{labels.SUBTITLE}</p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-background p-2 text-foreground shadow-lg sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tu ubicación
              </span>
              <span className="block truncate text-sm font-medium">
                {location?.label || labels.LOCATION_PLACEHOLDER}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>

          <div className="hidden h-8 w-px bg-border sm:block" />

          <div className="relative min-w-0 flex-[1.4]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={labels.SEARCH_PLACEHOLDER}
              aria-label={labels.SEARCH_PLACEHOLDER}
              className="border-0 bg-muted/60 pl-9 shadow-none focus-visible:ring-1"
            />
          </div>

          <Button
            type="button"
            onClick={onOpenLocationPicker}
            className="hidden shrink-0 gap-2 sm:inline-flex"
          >
            <LocateFixed data-icon="inline-start" />
            {labels.LOCATION_CTA}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-white/85">
          <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
            <strong className="font-semibold text-white">{matchCount}</strong> partidos disponibles
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
            <strong className="font-semibold text-white">{courtCount}</strong> canchas activas
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
            <strong className="font-semibold text-white">{sportsCount}</strong> deportes
          </span>
        </div>
      </div>
    </section>
  );
}
