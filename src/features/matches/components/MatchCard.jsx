"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { formatPrice } from "@/features/shared/lib/format";
import { MatchJoinButton } from "./MatchJoinButton";
import { MATCH_CONFIG } from "../config/match.constants";

/**
 * Admin match card: cover, availability, distance and management actions.
 * Consumers can also use it in the public discovery feed.
 */
export function MatchCard({
  match,
  onEdit,
  onDelete,
  onView,
  isAuthenticated = false,
  loginPath = MATCH_CONFIG.PATH,
  detailPath,
  showManagement = true,
  distanceLabel = null,
  className = "",
}) {
  const router = useRouter();
  const { can } = usePermission();
  const { UI, STATUS } = MATCH_CONFIG;
  const labels = UI.LABELS.CARD;

  const canUpdate = can(MATCH_CONFIG.PERMISSIONS.UPDATE);
  const canDelete = can(MATCH_CONFIG.PERMISSIONS.DELETE);
  const hasManagement = showManagement && (canUpdate || canDelete);
  const detailHref = detailPath || `${MATCH_CONFIG.PATH}/${match.id}`;
  const filled = match.capacity > 0 ? Math.min(100, (match.confirmedCount / match.capacity) * 100) : 0;

  const openDetail = () => router.push(detailHref);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={match.title}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)]">
        {match.coverPhoto || match.court?.coverPhoto ? (
          <img
            src={match.coverPhoto || match.court?.coverPhoto}
            alt={match.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-foreground/70">
            <Trophy className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="bg-background/90 text-foreground shadow-sm">
              {match.sport}
            </Badge>
            <span
              className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold shadow-sm ${
                STATUS.BADGES[match.status] || "bg-muted text-muted-foreground"
              }`}
            >
              {STATUS.LABELS[match.status] || match.status}
            </span>
          </div>

          {hasManagement && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-8 shrink-0 bg-background/90 shadow-sm"
                  aria-label="Acciones del partido"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(event) => event.stopPropagation()}
              >
                <DropdownMenuItem onClick={() => (onView ? onView(match) : openDetail())}>
                  <Trophy />
                  Ver detalle
                </DropdownMenuItem>
                {canUpdate && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(match)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(match)}>
                      <Trash2 />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {distanceLabel && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {labels.DISTANCE(distanceLabel)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link
            href={detailHref}
            onClick={(event) => event.stopPropagation()}
            className="line-clamp-2 font-semibold leading-snug hover:text-primary"
          >
            {match.title}
          </Link>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{match.court?.name || match.courtName || "Cancha por confirmar"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {match.dateLabel || match.scheduledAtDisplay || "—"}
          </span>
          {match.timeLabel && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 shrink-0" />
              {match.timeLabel}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {labels.SLOTS_LEFT(match.slotsLeft ?? match.capacity)}
            </span>
            <span>
              {match.confirmedCount ?? 0}/{match.capacity} confirmados
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${filled >= 100 ? "bg-amber-500" : "bg-primary"}`}
              style={{ width: `${filled}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatPrice(match.pricePerSlot)}
            </p>
            <p className="text-[11px] text-muted-foreground">{labels.PRICE}</p>
          </div>
          <div className="min-w-0" onClick={(event) => event.stopPropagation()}>
            <MatchJoinButton
              match={match}
              isAuthenticated={isAuthenticated}
              loginPath={loginPath}
              size="sm"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
