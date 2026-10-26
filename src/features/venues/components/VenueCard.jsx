import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import { ROUTES, cn } from "@/features/shared";
import { VENUE_CONFIG } from "../config/venue.constants";
import { getSportEmoji } from "@/features/shared/lib/sport";

const labels = VENUE_CONFIG.UI.DETAIL;

/**
 * Public venue card shared by home and `/canchas`.
 * It always navigates to the venue detail, never to the admin panel.
 */
export function VenueCard({ venue, distanceLabel = null, variant = "default", className = "" }) {
  if (!venue) return null;

  const compact = variant === "compact";

  return (
    <Link
      href={`${ROUTES.PUBLIC.COURTS.path}/${venue.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "aspect-[4/5]" : "aspect-[16/10]",
        className
      )}
    >
      {venue.photo ? (
        <img
          src={venue.photo}
          alt={venue.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/5 to-transparent text-4xl">
          {getSportEmoji(venue.sport)}
        </span>
      )}

      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

      {distanceLabel && (
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          <MapPin className="size-3" />
          {distanceLabel}
        </span>
      )}

      <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
        {getSportEmoji(venue.sport)} {venue.sport}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className={cn("truncate font-semibold text-white", compact ? "text-sm" : "text-base")}>
          {venue.name}
        </p>
        {venue.address && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">{venue.address}</p>
        )}
        <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
          <Trophy className="size-3" />
          {venue.upcomingMatches > 0
            ? labels.MATCHES(venue.upcomingMatches)
            : labels.NO_MATCHES}
        </p>
      </div>
    </Link>
  );
}
