"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  List,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, cn } from "@/features/shared";
import {
  DISCOVERY_CONFIG,
  getSportEmoji,
} from "@/features/discovery/config/discovery.constants";
import { DiscoveryEmpty } from "@/features/discovery/components/DiscoveryEmpty";
import { DiscoveryFilterSheet } from "@/features/discovery/components/DiscoveryFilterSheet";
import { DiscoveryLocationButton } from "@/features/discovery/components/DiscoveryLocationButton";
import { DiscoveryMapWrapper } from "@/features/discovery/components/DiscoveryMapWrapper";
import { DiscoveryMatchCard } from "@/features/discovery/components/DiscoveryMatchCard";
import { LocationPickerDialog } from "@/features/discovery/components/LocationPickerDialog";
import { MatchCheckoutSheet } from "@/features/discovery/components/MatchCheckoutSheet";
import { useMatchSearchFilters } from "../hooks/use-match-search-filters";
import { useMatchSearchLocation } from "../hooks/use-match-search-location";

/**
 * `/partidos`: the only match search surface.
 *
 * Every filter is kept in the URL. Tapping a card opens a quick preview drawer;
 * the full information lives at the canonical `/partidos/[id]` route and is
 * reachable from the preview CTA.
 */
export function MatchSearchView({
  matches = [],
  courts = [],
  subscription = null,
  isAuthenticated = false,
  canStaffConfirm = false,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    location,
    recentLocations,
    selectLocation,
    clearRecentLocations,
    locate,
    isLocating,
    geoError,
  } = useMatchSearchLocation();

  const {
    filters,
    setters,
    sports,
    filteredMatches,
    hasActiveFilters,
    clearFilters,
    showAllMatches,
    distanceEnabled,
  } = useMatchSearchFilters(matches, location);

  const labels = DISCOVERY_CONFIG.UI.MATCHES_STAGE;
  const filterLabels = DISCOVERY_CONFIG.UI.FILTERS;
  const sectionLabels = DISCOVERY_CONFIG.UI.SECTIONS;

  const courtFilter = filters.courtId
    ? courts.find((court) => court.id === filters.courtId)
    : null;

  const filtersCount = [
    Boolean(filters.searchTerm?.trim()),
    filters.dateFilter !== "all",
    filters.radius !== DISCOVERY_CONFIG.RADIUS.DEFAULT,
    Boolean(filters.courtId),
  ].filter(Boolean).length;

  const dateOption = DISCOVERY_CONFIG.DATE_FILTERS.find(
    (option) => option.value === filters.dateFilter
  );
  const radiusOption = DISCOVERY_CONFIG.RADIUS.OPTIONS.find(
    (option) => String(option.value) === String(filters.radius)
  );

  const activeChips = [];
  if (filters.searchTerm?.trim()) {
    activeChips.push({
      key: "search",
      label: filters.searchTerm.trim(),
      icon: Search,
      onRemove: () => setters.setSearchTerm(""),
    });
  }
  if (dateOption && filters.dateFilter !== "all") {
    activeChips.push({
      key: "date",
      label: dateOption.label,
      onRemove: () => setters.setDateFilter("all"),
    });
  }
  if (radiusOption && filters.radius !== DISCOVERY_CONFIG.RADIUS.DEFAULT) {
    activeChips.push({
      key: "radius",
      label: radiusOption.label,
      onRemove: () => setters.setRadius(DISCOVERY_CONFIG.RADIUS.DEFAULT),
    });
  }
  if (courtFilter) {
    activeChips.push({
      key: "court",
      label: courtFilter.name,
      onRemove: () => setters.setCourtFilter(null),
    });
  }

  const hasMatches = filteredMatches.length > 0;
  const nextPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const openPreview = (match) => {
    setSelectedMatch(match);
    setPreviewOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-1">
          {isAuthenticated && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="-ml-2 mt-0.5 shrink-0 rounded-full"
            >
              <Link href={ROUTES.PLAYER.HOME.path} aria-label={labels.BACK}>
                <ArrowLeft />
              </Link>
            </Button>
          )}

          <div className="min-w-0 flex-1 pl-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {labels.EYEBROW}
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {labels.TITLE}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {labels.SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setFilterOpen(true)}
            aria-label={labels.OPEN_FILTERS}
            className="relative mt-0.5 shrink-0 rounded-full"
          >
            <SlidersHorizontal className="size-4" />
            {filtersCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {filtersCount}
              </span>
            )}
          </Button>
        </div>

        <DiscoveryLocationButton
          location={location}
          onClick={() => setPickerOpen(true)}
          className="mt-4"
        />

        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {filterLabels.SPORTS}
          </p>
          <div
            role="group"
            aria-label={filterLabels.SPORTS}
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              onClick={() => setters.setSport("all")}
              aria-pressed={filters.sport === "all"}
              className={cn(
                "h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-3.5 sm:text-[13px]",
                filters.sport === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filterLabels.ALL_SPORTS}
            </button>
            {sports.map((sport) => (
              <button
                key={sport.value}
                type="button"
                onClick={() => setters.setSport(sport.value)}
                aria-pressed={filters.sport === sport.value}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-3.5 sm:text-[13px]",
                  filters.sport === sport.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <span aria-hidden="true" className="hidden sm:inline">
                  {sport.emoji || getSportEmoji(sport.value)}
                </span>
                {sport.value}
              </button>
            ))}
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activeChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex h-7 max-w-[220px] shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 text-[11px] font-semibold text-primary"
                >
                  {Icon ? <Icon className="size-3 shrink-0" /> : null}
                  <span className="truncate">{chip.label}</span>
                  <X className="size-3 shrink-0" />
                </button>
              );
            })}
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 px-1.5 text-[11px] font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {labels.CLEAR}
            </button>
          </div>
        )}
      </section>

      {hasMatches && (
        <div className="flex items-end justify-between gap-3 px-1">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight">
              {location ? sectionLabels.MATCHES_TITLE : sectionLabels.MATCHES_TITLE_ALL}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {sectionLabels.MATCHES_SUBTITLE(filteredMatches.length)}
            </p>
          </div>

          <div
            role="group"
            aria-label={labels.VIEW}
            className="flex shrink-0 items-center rounded-full border border-border/70 bg-card p-1"
          >
            <button
              type="button"
              onClick={() => setters.setView(DISCOVERY_CONFIG.VIEW.LIST)}
              aria-pressed={filters.view === DISCOVERY_CONFIG.VIEW.LIST}
              aria-label={filterLabels.VIEW_LIST}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                filters.view === DISCOVERY_CONFIG.VIEW.LIST
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">{filterLabels.VIEW_LIST}</span>
            </button>
            <button
              type="button"
              onClick={() => setters.setView(DISCOVERY_CONFIG.VIEW.MAP)}
              aria-pressed={filters.view === DISCOVERY_CONFIG.VIEW.MAP}
              aria-label={filterLabels.VIEW_MAP}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                filters.view === DISCOVERY_CONFIG.VIEW.MAP
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapIcon className="size-3.5" />
              <span className="hidden sm:inline">{filterLabels.VIEW_MAP}</span>
            </button>
          </div>
        </div>
      )}

      {!hasMatches ? (
        <DiscoveryEmpty
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onExpandRadius={showAllMatches}
        />
      ) : filters.view === DISCOVERY_CONFIG.VIEW.MAP ? (
        <DiscoveryMapWrapper
          matches={filteredMatches}
          location={location}
          height={520}
          onSelectMatch={openPreview}
        />
      ) : (
        <div className="space-y-2.5 pb-2">
          {filteredMatches.map((match) => (
            <DiscoveryMatchCard
              key={match.id}
              match={match}
              onClick={() => openPreview(match)}
            />
          ))}
        </div>
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

      <DiscoveryFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        setters={setters}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        distanceEnabled={distanceEnabled}
      />

      <MatchCheckoutSheet
        match={selectedMatch}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        isAuthenticated={isAuthenticated}
        subscription={subscription}
        canStaffConfirm={canStaffConfirm}
        nextPath={nextPath}
        detailHref={
          selectedMatch
            ? `${DISCOVERY_CONFIG.PATHS.MATCHES}/${selectedMatch.id}`
            : null
        }
      />
    </div>
  );
}
