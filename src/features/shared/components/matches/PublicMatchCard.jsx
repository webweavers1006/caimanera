"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { cn } from "@/features/shared";
import { formatPrice } from "@/features/shared/lib/format";
import { MATCH_UI } from "@/features/shared/config/match-ui.constants";
import { getSportEmoji } from "@/features/shared/lib/sport";

function statusLabel(match) {
  if (match.isEnrolled) {
    return match.myStatus === "WAITLIST" ? "En espera" : "Confirmado";
  }
  if (match.isFull) return "Lleno";
  if (match.status === "IN_PROGRESS") return "En curso";
  if (match.status === "COMPLETED") return "Finalizado";
  if (match.status === "CANCELED") return "Cancelado";
  return "Disponible";
}

function statusTone(match, available) {
  if (match.isEnrolled) {
    return match.myStatus === "WAITLIST"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "bg-primary/15 text-primary";
  }
  if (available) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

/**
 * Mobile-first match row used across the player surfaces.
 *
 * With `href` it is a real link (canonical `/partidos/[id]` navigation); without
 * it, it behaves as a button for quick previews such as "Mis partidos".
 * `compact` is a horizontal snap card for carousels; `row` fills the list.
 */
export function PublicMatchCard({
  match,
  onClick,
  href = null,
  variant = "row",
  className = "",
}) {
  const labels = MATCH_UI.CARD;
  const capacity = Number(match.capacity || 0);
  const slotsLeft = Number(match.slotsLeft ?? 0);
  const filled =
    capacity > 0
      ? Math.min(100, (Number(match.confirmedCount || 0) / capacity) * 100)
      : 0;
  const available =
    !match.isFull &&
    !match.isPast &&
    !["CANCELED", "COMPLETED", "IN_PROGRESS"].includes(match.status);
  const status = statusLabel(match);
  const slotsText =
    capacity > 0
      ? `${slotsLeft} de ${capacity} cupos`
      : "Cupos por confirmar";

  const rootClassName = cn(
    "group flex cursor-pointer flex-col rounded-3xl border border-border/70 bg-card p-4 shadow-sm transition-colors",
    "hover:border-primary/40 active:border-primary/50 active:bg-muted/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    variant === "compact" && "min-w-[286px] snap-start",
    className
  );

  const body = (
    <>
      <div className="flex gap-3">
        <div className="relative size-[76px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
          {match.coverPhoto || match.court?.coverPhoto ? (
            <img
              src={match.coverPhoto || match.court?.coverPhoto}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl">
              {getSportEmoji(match.sport)}
            </span>
          )}
          {match.distanceLabel && (
            <span className="absolute inset-x-1 bottom-1 truncate rounded-full bg-black/65 px-1.5 py-0.5 text-center text-[9px] font-semibold text-white backdrop-blur">
              {match.distanceLabel}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
              {match.title}
            </h3>
            <span className="shrink-0 text-right">
              <span className="block text-[15px] font-bold leading-tight text-primary">
                {formatPrice(match.pricePerSlot)}
              </span>
              <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {labels.PRICE}
              </span>
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{match.court?.name || "Cancha por confirmar"}</span>
          </p>

          <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" />
              {match.dateLabel || "—"}
            </span>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" />
              {match.timeLabel || "—"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5 border-t border-border/50 pt-2.5">
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Users className="size-3.5" />
          {slotsText}
        </span>

        <span
          aria-hidden="true"
          className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-muted"
        >
          <span
            className={cn(
              "block h-full rounded-full transition-all",
              filled >= 100 || !available ? "bg-amber-400" : "bg-primary"
            )}
            style={{ width: `${filled}%` }}
          />
        </span>

        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            statusTone(match, available)
          )}
        >
          {status}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Ver ${match.title}`} className={rootClassName}>
        {body}
      </Link>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Ver ${match.title}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={rootClassName}
    >
      {body}
    </article>
  );
}
