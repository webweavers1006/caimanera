"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MATCH_CONFIG } from "../config/match.constants";
import { PARTICIPANT_CONFIG } from "@/features/participants";

/**
 * Initials from a full name (max 2 chars).
 */
function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Participants as a grid of player cards with avatar, position and badges.
 */
export function MatchParticipantsTab({ participants }) {
  const { DETAIL } = MATCH_CONFIG.UI.LABELS;
  const { STATUS, PAYMENT_TYPE } = PARTICIPANT_CONFIG;

  if (!participants || participants.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        {DETAIL.PARTICIPANTS.EMPTY}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary/70" />
        {DETAIL.TABS.PARTICIPANTS}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-3 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/40"
          >
            <Avatar size="lg">
              <AvatarFallback name={p.userName}>{initials(p.userName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{p.userName || "—"}</p>
              <p className="text-sm text-muted-foreground">
                {p.position || DETAIL.PARTICIPANTS.NO_POSITION}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS.BADGES[p.status] || "bg-slate-100 text-slate-700"}`}
                >
                  {STATUS.LABELS[p.status] || p.status}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_TYPE.BADGES[p.paymentType] || "bg-slate-100 text-slate-700"}`}
                >
                  {PAYMENT_TYPE.LABELS[p.paymentType] || p.paymentType}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
