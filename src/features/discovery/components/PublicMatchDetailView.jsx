"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Share2,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MATCH_CONFIG } from "@/features/matches/config/match.constants";
import { formatPrice } from "@/features/shared/lib/format";
import { DISCOVERY_CONFIG, getSportEmoji } from "../config/discovery.constants";
import { distanceInKm, formatDistance } from "../lib/geo";
import { useDiscoveryLocation } from "../hooks/use-discovery-location";
import { DiscoveryMapWrapper } from "./DiscoveryMapWrapper";
import { MatchCheckoutSheet } from "./MatchCheckoutSheet";

export function PublicMatchDetailView({
  match,
  isAuthenticated = false,
  subscription = null,
  canStaffConfirm = false,
}) {
  const { location } = useDiscoveryLocation();
  const [activePhoto, setActivePhoto] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const photos = match.photos?.length ? match.photos : match.court?.coverPhoto ? [match.court.coverPhoto] : [];
  const confirmed = match.confirmedCount || 0;
  const filled = match.capacity > 0 ? Math.min(100, (confirmed / match.capacity) * 100) : 0;
  const labels = DISCOVERY_CONFIG.UI.CARD;

  const distance = useMemo(() => {
    if (!location || !match.court) return null;
    const km = distanceInKm(location, match.court);
    return km == null ? null : formatDistance(km);
  }, [location, match.court]);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: match.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace copiado.");
      }
    } catch {
      // Sharing was cancelled; no error needed.
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <Link
        href="/#partidos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a partidos
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl border bg-muted">
            <div className="aspect-[16/10] w-full">
              {photos[activePhoto] ? (
                <img
                  src={photos[activePhoto]}
                  alt={match.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)] text-5xl">
                  {getSportEmoji(match.sport)}
                </div>
              )}
            </div>
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <Badge className="bg-background/90 text-foreground shadow-sm">
                {getSportEmoji(match.sport)} {match.sport}
              </Badge>
              <span
                className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold shadow-sm ${
                  MATCH_CONFIG.STATUS.BADGES[match.status] || "bg-muted text-muted-foreground"
                }`}
              >
                {MATCH_CONFIG.STATUS.LABELS[match.status] || match.status}
              </span>
            </div>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={share}
              className="absolute right-3 top-3 size-9 bg-background/90 shadow-sm"
              aria-label="Compartir partido"
            >
              <Share2 />
            </Button>
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    index === activePhoto ? "border-primary" : "border-transparent opacity-70"
                  }`}
                  aria-label={`Foto ${index + 1}`}
                >
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{match.title}</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {match.dateTimeLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-4" />
                {match.durationMins} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {match.court?.name}
                {distance ? ` · a ${distance}` : ""}
              </span>
            </p>
          </div>

          {match.court?.description && (
            <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
              {match.court.description}
            </p>
          )}

          {match.court?.latitude != null && match.court?.longitude != null && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Ubicación de la cancha</h2>
              <DiscoveryMapWrapper matches={[match]} location={location} height={320} />
              {match.court.address && (
                <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {match.court.address}
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-3xl border bg-card p-5 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(match.pricePerSlot)}
                </p>
                <p className="text-xs text-muted-foreground">{labels.PRICE}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <Users className="size-3.5" />
                {labels.SLOTS(match.capacity)}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{labels.SLOTS_LEFT(match.slotsLeft)}</span>
                <span>
                  {confirmed}/{match.capacity}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${filled >= 100 ? "bg-amber-500" : "bg-primary"}`}
                  style={{ width: `${filled}%` }}
                />
              </div>
            </div>

            <Button
              type="button"
              className="h-12 w-full rounded-full font-semibold"
              onClick={() => setCheckoutOpen(true)}
            >
              {match.isEnrolled
                ? match.myStatus === "WAITLIST"
                  ? "Gestionar lista de espera"
                  : "Gestionar mi inscripción"
                : match.isFull
                  ? "Unirme a la lista de espera"
                  : isAuthenticated
                    ? "Inscribirme"
                    : "Iniciar sesión para inscribirme"}
            </Button>

            {match.allowSubscription && (
              <p className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
                <Ticket className="mt-0.5 size-4 shrink-0 text-primary" />
                Acepta jugadores con pase activo. Si tienes créditos, se descuentan automáticamente.
              </p>
            )}
          </div>

          <div className="rounded-3xl border bg-card p-5 text-sm">
            <p className="mb-2 flex items-center gap-2 font-semibold">
              <Trophy className="size-4 text-primary" />
              Detalles del partido
            </p>
            <dl className="space-y-2 text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Organiza</dt>
                <dd className="text-right font-medium text-foreground">
                  {match.hostName || "Caimanera"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Cancha</dt>
                <dd className="text-right font-medium text-foreground">{match.court?.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Deporte</dt>
                <dd className="text-right font-medium text-foreground">{match.sport}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Duración</dt>
                <dd className="text-right font-medium text-foreground">{match.durationMins} min</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Confirmados</dt>
                <dd className="text-right font-medium text-foreground">{confirmed}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <MatchCheckoutSheet
        match={match}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        isAuthenticated={isAuthenticated}
        subscription={subscription}
        canStaffConfirm={canStaffConfirm}
        nextPath={`${DISCOVERY_CONFIG.PATHS.MATCHES}/${match.id}`}
      />
    </div>
  );
}
