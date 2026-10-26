"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ROUTES } from "@/features/shared";
import { useDiscoveryLocation } from "../hooks/use-discovery-location";
import { useDiscoveryFilters } from "../hooks/use-discovery-filters";
import { orderByDistanceKm } from "../lib/geo";
import { DiscoveryHome } from "./DiscoveryHome";
import { DiscoveryMatchesStage } from "./DiscoveryMatchesStage";
import { LocationPickerDialog } from "./LocationPickerDialog";
import { MatchCheckoutSheet } from "./MatchCheckoutSheet";

function scrollTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Public discovery experience with two intentional stages:
 * 1. Home: location, three actions and nearby venues.
 * 2. Match picker: sport tabs, filters and checkout preview.
 */
export function DiscoveryView({
  matches = [],
  courts = [],
  subscription = null,
  isAuthenticated = false,
  userName = null,
  canStaffConfirm = false,
  initialStage = "home",
}) {
  const [stage, setStage] = useState(initialStage);
  const [view, setView] = useState("list");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("preview");
  const deepLinkOpened = useRef(false);

  const {
    location,
    recentLocations,
    selectLocation,
    clearRecentLocations,
    locate,
    isLocating,
    geoError,
  } = useDiscoveryLocation();

  const {
    filters,
    setters,
    sports,
    filteredMatches,
    hasActiveFilters,
    clearFilters,
    showAllMatches,
    distanceEnabled,
  } = useDiscoveryFilters(matches, location);

  const sortedCourts = useMemo(() => {
    if (!location) return courts;
    return orderByDistanceKm(courts, location);
  }, [courts, location]);

  // Bottom navigation uses hashes so the match picker can be deep-linked.
  // Reconcile the stage when the user enters from /#partidos or goes back home.
  useEffect(() => {
    const applyHash = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("ver") === "partidos") {
        setStage("matches");
        scrollTop();
        return;
      }

      const hash = window.location.hash;
      if (hash === "#partidos") {
        setStage("matches");
        scrollTop();
      } else if (hash === "#canchas") {
        setStage("home");
        requestAnimationFrame(() => {
          document.getElementById("canchas")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } else if (initialStage !== "matches") {
        setStage("home");
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [initialStage]);

  const handleSelectLocation = (nextLocation) => {
    selectLocation(nextLocation);
    setters.setSort("distance");
  };

  const handleLocate = async () => {
    const nextLocation = await locate();
    if (nextLocation) setters.setSort("distance");
    return nextLocation;
  };

  const openMatches = (options = {}) => {
    if (options.court) setters.setSearchTerm(options.court.name);
    else setters.setSearchTerm("");
    if (options.map) setView("map");
    else if (!options.keepView) setView("list");
    setStage("matches");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#partidos");
      window.dispatchEvent(new Event("hashchange"));
    }
    scrollTop();
  };

  const goHome = () => {
    setStage("home");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/");
      window.dispatchEvent(new Event("hashchange"));
    }
    scrollTop();
  };

  const handleViewCourtMatches = (court) => {
    openMatches({ court });
  };

  const handleOpenMatch = (match, step = "preview") => {
    setSelectedMatch(match);
    setCheckoutStep(step);
    setCheckoutOpen(true);
  };

  // Deep link: /?partido=<id> opens the checkout for a shared match.
  useEffect(() => {
    if (deepLinkOpened.current) return;
    const matchId = new URLSearchParams(window.location.search).get("partido");
    if (!matchId) return;
    const match = matches.find((item) => item.id === matchId);
    if (!match) return;

    deepLinkOpened.current = true;
    setSelectedMatch(match);
    setCheckoutStep("preview");
    setCheckoutOpen(true);
  }, [matches]);

  return (
    <div className={stage === "home" ? "space-y-6" : "space-y-4"}>
      {stage === "home" ? (
        <DiscoveryHome
          courts={sortedCourts}
          location={location}
          userName={userName}
          onOpenLocationPicker={() => setPickerOpen(true)}
          onOpenMatches={() => openMatches()}
          onOpenMap={() => openMatches({ map: true })}
          onViewCourtMatches={handleViewCourtMatches}
        />
      ) : (
        <DiscoveryMatchesStage
          matches={filteredMatches}
          sports={sports}
          filters={filters}
          setters={setters}
          view={view}
          setView={setView}
          location={location}
          onBack={isAuthenticated ? goHome : undefined}
          onOpenMatch={handleOpenMatch}
          onOpenLocationPicker={() => setPickerOpen(true)}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          showAllMatches={showAllMatches}
          distanceEnabled={distanceEnabled}
        />
      )}

      <LocationPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        courts={courts}
        recentLocations={recentLocations}
        onSelect={handleSelectLocation}
        onLocate={handleLocate}
        onClearRecents={clearRecentLocations}
        isLocating={isLocating}
        geoError={geoError}
      />

      <MatchCheckoutSheet
        match={selectedMatch}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        isAuthenticated={isAuthenticated}
        subscription={subscription}
        canStaffConfirm={canStaffConfirm}
        initialStep={checkoutStep}
        nextPath={stage === "matches" ? ROUTES.PUBLIC.MATCHES.path : ROUTES.PLAYER.HOME.path}
      />
    </div>
  );
}
