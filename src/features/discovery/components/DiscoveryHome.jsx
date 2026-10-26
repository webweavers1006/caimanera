"use client";

import { Map as MapIcon, MapPin, Search } from "lucide-react";
import { cn } from "@/features/shared";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";
import { DiscoveryLocationButton } from "./DiscoveryLocationButton";
import { DiscoveryVenues } from "./DiscoveryVenues";

const SERVICES = [
  { key: "matches", label: DISCOVERY_CONFIG.UI.HOME.SERVICES.MATCHES, icon: Search, action: "matches", featured: true },
  { key: "courts", label: DISCOVERY_CONFIG.UI.HOME.SERVICES.COURTS, icon: MapPin, action: "courts" },
  { key: "map", label: DISCOVERY_CONFIG.UI.HOME.SERVICES.MAP, icon: MapIcon, action: "map" },
];

function scrollToId(id) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Stage 1: a deliberately small home.
 * Welcome module → location → three actions → venue mosaic.
 */
export function DiscoveryHome({
  courts = [],
  location,
  userName = null,
  onOpenLocationPicker,
  onOpenMatches,
  onOpenMap,
  onViewCourtMatches,
}) {
  const labels = DISCOVERY_CONFIG.UI.HOME;

  const handleService = (action) => {
    if (action === "matches") return onOpenMatches?.();
    if (action === "map") return onOpenMap?.();
    if (action === "courts") {
      if (courts.length > 0) return scrollToId("canchas");
      return onOpenMatches?.();
    }
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {labels.GREETING(userName)}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {labels.TITLE}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              {labels.SUBTITLE}
            </p>
          </div>

          <DiscoveryLocationButton
            location={location}
            onClick={onOpenLocationPicker}
            className="lg:w-80 lg:shrink-0"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 px-1">
          <h2 className="text-lg font-bold tracking-tight">{labels.ACTIONS_TITLE}</h2>
          <p className="text-xs text-muted-foreground">{labels.ACTIONS_SUBTITLE}</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => handleService(service.action)}
                className={cn(
                  "group flex min-h-[104px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/70 bg-background/60 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  service.featured && "border-primary/30 bg-primary/10"
                )}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20",
                    service.featured && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-[11px] font-semibold leading-tight">
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <DiscoveryVenues
        courts={courts.slice(0, 3)}
        location={location}
        onViewMatches={onViewCourtMatches}
      />
    </div>
  );
}
