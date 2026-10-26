"use client";

import { MapPin, SearchX, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

export function DiscoveryEmpty({
  hasFilters,
  onClearFilters,
  onExpandRadius,
}) {
  const labels = DISCOVERY_CONFIG.UI.EMPTY;

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {hasFilters ? <SearchX className="size-6" /> : <Trophy className="size-6" />}
      </span>
      <h3 className="text-lg font-semibold">
        {hasFilters ? labels.SEARCH_TITLE : labels.TITLE}
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {hasFilters ? labels.SEARCH_DESCRIPTION : labels.DESCRIPTION}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasFilters ? (
          <Button onClick={onClearFilters}>{labels.SEARCH_ACTION}</Button>
        ) : (
          <Button onClick={onExpandRadius} className="gap-2">
            <MapPin data-icon="inline-start" />
            {labels.ACTION}
          </Button>
        )}
      </div>
    </div>
  );
}
