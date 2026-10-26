"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/features/shared";
import { LOCATION_CONFIG } from "../config/location.constants";

/**
 * Shared location selector used by the home, search and venue surfaces so the
 * same control looks and behaves identically everywhere.
 */
export function LocationButton({ location, onClick, className = "" }) {
  const labels = LOCATION_CONFIG.UI;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <MapPin className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {location ? labels.BUTTON_NEAR : labels.BUTTON_LABEL}
        </span>
        <span className="block truncate text-sm font-medium">
          {location?.label || labels.BUTTON_PLACEHOLDER}
        </span>
      </span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
        <ChevronDown className="size-4" />
      </span>
    </button>
  );
}
