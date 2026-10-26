"use client";

import { List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

function FilterSelect({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function DiscoveryFilters({
  sports = [],
  filters,
  setters,
  hasActiveFilters,
  clearFilters,
  view,
  setView,
  distanceEnabled,
}) {
  const labels = DISCOVERY_CONFIG.UI.FILTERS;
  const sortOptions = DISCOVERY_CONFIG.SORT.OPTIONS.filter(
    (option) => option.value !== "distance" || distanceEnabled
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setters.setSport("all")}
          aria-pressed={filters.sport === "all"}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            filters.sport === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card hover:bg-muted"
          }`}
        >
          {labels.ALL_SPORTS}
        </button>
        {sports.map((sport) => (
          <button
            key={sport.value}
            type="button"
            onClick={() => setters.setSport(sport.value)}
            aria-pressed={filters.sport === sport.value}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filters.sport === sport.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            <span aria-hidden="true">{sport.emoji}</span>
            {sport.value}
            <span className="text-xs opacity-70">{sport.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-wrap items-end gap-3">
          <FilterSelect label={labels.DATE}>
            <NativeSelect
              value={filters.dateFilter}
              onChange={(event) => setters.setDateFilter(event.target.value)}
              className="w-full"
              aria-label={labels.DATE}
            >
              {DISCOVERY_CONFIG.DATE_FILTERS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FilterSelect>

          <FilterSelect label={labels.RADIUS}>
            <NativeSelect
              value={String(filters.radius)}
              onChange={(event) =>
                setters.setRadius(
                  event.target.value === "all" ? "all" : Number(event.target.value)
                )
              }
              className="w-full"
              aria-label={labels.RADIUS}
              disabled={!distanceEnabled}
            >
              {DISCOVERY_CONFIG.RADIUS.OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={String(option.value)}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FilterSelect>

          <FilterSelect label={labels.SORT}>
            <NativeSelect
              value={filters.sort}
              onChange={(event) => setters.setSort(event.target.value)}
              className="w-full"
              aria-label={labels.SORT}
            >
              {sortOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FilterSelect>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <X data-icon="inline-start" />
              {labels.CLEAR}
            </Button>
          )}

          <div className="flex items-center rounded-xl border bg-background p-0.5">
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className="gap-1.5"
            >
              <List data-icon="inline-start" />
              {labels.VIEW_LIST}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "map" ? "secondary" : "ghost"}
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className="gap-1.5"
            >
              <MapIcon data-icon="inline-start" />
              {labels.VIEW_MAP}
            </Button>
          </div>
        </div>
      </div>

      {distanceEnabled && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          {labels.RADIUS_HINT}
        </p>
      )}
    </div>
  );
}
