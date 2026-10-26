"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, cn } from "@/features/shared";
import { PLAYER_CONFIG } from "../config/player.constants";
import { distanceInKm, formatDistance } from "@/features/location/lib/geo";
import { useLocation } from "@/features/location/hooks/use-location";
import { PublicMatchCard } from "@/features/shared/components/matches/PublicMatchCard";
import { MatchCheckoutSheet } from "@/features/booking/components/MatchCheckoutSheet";

function EmptyState({ title, description, action, icon: Icon = CalendarCheck }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button asChild className="mt-5 gap-2 rounded-full">
        <Link href={ROUTES.PUBLIC.MATCHES.path}>
          <Search data-icon="inline-start" />
          {action}
        </Link>
      </Button>
    </div>
  );
}

/**
 * Public "Mis partidos": the player's upcoming enrollments and the history of
 * matches already played. Upcoming matches reuse the checkout sheet so managing
 * a booking feels identical to joining one; history is read-only and links to
 * the canonical match detail.
 */
export function MyMatchesView({ upcoming = [], past = [] }) {
  const labels = PLAYER_CONFIG.MY_MATCHES;
  const { location } = useLocation();
  const [tab, setTab] = useState(
    upcoming.length === 0 && past.length > 0 ? "history" : "upcoming"
  );
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const decorate = useCallback(
    (list) =>
      (list || []).map((match) => {
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
        };
      }),
    [location]
  );

  const upcomingItems = useMemo(() => decorate(upcoming), [decorate, upcoming]);
  const pastItems = useMemo(() => decorate(past), [decorate, past]);
  const history = tab === "history";
  const items = history ? pastItems : upcomingItems;
  const totalItems = upcomingItems.length + pastItems.length;

  const handleOpenMatch = (match) => {
    setSelectedMatch(match);
    setCheckoutOpen(true);
  };

  const tabs = [
    { key: "upcoming", label: labels.TABS.UPCOMING, count: upcomingItems.length },
    { key: "history", label: labels.TABS.HISTORY, count: pastItems.length },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {labels.EYEBROW}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{labels.TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{labels.SUBTITLE}</p>
      </header>

      {totalItems > 0 && (
        <div
          role="tablist"
          aria-label={labels.TITLE}
          className="mt-4 inline-flex rounded-full border border-border/70 bg-card p-1 shadow-sm"
        >
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    active ? "bg-primary-foreground/20" : "bg-muted"
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        history ? (
          <EmptyState
            title={labels.HISTORY_EMPTY_TITLE}
            description={labels.HISTORY_EMPTY_DESCRIPTION}
            action={labels.HISTORY_EMPTY_ACTION}
            icon={History}
          />
        ) : (
          <EmptyState
            title={labels.EMPTY_TITLE}
            description={labels.EMPTY_DESCRIPTION}
            action={labels.EMPTY_ACTION}
          />
        )
      ) : (
        <div className="mt-5 space-y-2.5 pb-2">
          {history ? (
            <p className="px-1 text-xs font-medium text-muted-foreground">
              {labels.HISTORY_COUNT(items.length)}
            </p>
          ) : null}

          {items.map((match) =>
            history ? (
              <PublicMatchCard
                key={match.id}
                match={match}
                href={`${ROUTES.PUBLIC.MATCHES.path}/${match.id}`}
              />
            ) : (
              <PublicMatchCard
                key={match.id}
                match={match}
                onClick={() => handleOpenMatch(match)}
              />
            )
          )}

          <p className="px-2 pt-1 text-center text-[11px] text-muted-foreground">
            {history ? labels.HISTORY_HINT : labels.HINT}
          </p>
        </div>
      )}

      <MatchCheckoutSheet
        match={selectedMatch}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        isAuthenticated
        nextPath={ROUTES.PLAYER.MY_MATCHES.path}
      />
    </div>
  );
}
