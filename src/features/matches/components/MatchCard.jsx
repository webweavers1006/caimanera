"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, MapPin, Trophy, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { enrollInMatchAction } from "../actions/match.enroll.action";
import { MATCH_CONFIG } from "../config/match.constants";

/**
 * Single match card: cover photo, badges, info and an "Inscribirse" button.
 * Clicking the card opens the full detail page.
 */
export function MatchCard({ match }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { LABELS } = MATCH_CONFIG.UI;
  const { STATUS } = MATCH_CONFIG;

  const openDetail = () => router.push(`${MATCH_CONFIG.PATH}/${match.id}`);

  const handleJoin = (event) => {
    event.stopPropagation();
    startTransition(async () => {
      const result = await enrollInMatchAction(match.id);
      if (result.success) {
        toast.success(result.message || "Inscripción realizada.");
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo inscribir.");
      }
    });
  };

  return (
    <div
      onClick={openDetail}
      className="group cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Cover — fixed 16:9 aspect ratio for a consistent look */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)]">
        {match.coverPhoto ? (
          <img
            src={match.coverPhoto}
            alt={match.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-foreground/70">
            <Trophy className="h-10 w-10" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{match.sport}</Badge>
          <span
            className={`inline-flex h-5 items-center rounded-2xl px-2 text-xs font-medium ${STATUS.BADGES[match.status] || "bg-slate-100 text-slate-700"}`}
          >
            {STATUS.LABELS[match.status] || match.status}
          </span>
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug">{match.title}</h3>
          <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {match.scheduledAtDisplay || "—"}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {match.courtName || "—"}
            </p>
          </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {match.capacity} {LABELS.CARD.SLOTS}
          </span>
          <span className="font-semibold text-primary">
            ${match.pricePerSlot}{" "}
            <span className="text-xs font-normal text-muted-foreground">{LABELS.CARD.PRICE}</span>
          </span>
        </div>

        <Button onClick={handleJoin} disabled={isPending} className="w-full gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {LABELS.CARD.JOIN}
        </Button>
      </div>
    </div>
  );
}
