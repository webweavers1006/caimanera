"use client";

import { CalendarDays, Clock, DollarSign, MapPin, Trophy, UserCheck, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/StatCard";
import { MatchCourtTab } from "./MatchCourtTab";
import { MatchParticipantsTab } from "./MatchParticipantsTab";
import { MATCH_CONFIG } from "../config/match.constants";

export function MatchDetailView({ match }) {
  const { DETAIL } = MATCH_CONFIG.UI.LABELS;
  const { STATUS } = MATCH_CONFIG;

  const confirmed = (match.participants || []).filter((p) => p.status === "CONFIRMED").length;

  const statusBadge = (
    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
      {STATUS.LABELS[match.status] || match.status}
    </span>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)] p-6 text-primary-foreground shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{match.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {match.scheduledAtDisplay || "—"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {match.court?.name || "Sin cancha"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">{match.sport}</span>
            {statusBadge}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} title={DETAIL.STATS.CAPACITY} value={match.capacity ?? 0} />
        <StatCard
          icon={DollarSign}
          title={DETAIL.STATS.PRICE}
          value={match.pricePerSlot ?? 0}
          subtitle={DETAIL.STATS.PRICE_SUBTITLE}
          variant="closed"
        />
        <StatCard
          icon={Clock}
          title={DETAIL.STATS.DURATION}
          value={match.durationMins ?? 0}
          subtitle={DETAIL.STATS.DURATION_SUBTITLE}
        />
        <StatCard
          icon={UserCheck}
          title={DETAIL.STATS.CONFIRMED}
          value={confirmed}
          subtitle={DETAIL.STATS.CONFIRMED_SUBTITLE}
          variant="open"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="court" className="w-full">
        <TabsList>
          <TabsTrigger value="court" className="gap-2">
            <Trophy className="h-4 w-4" />
            {DETAIL.TABS.COURT}
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-2">
            <Users className="h-4 w-4" />
            {DETAIL.TABS.PARTICIPANTS}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="court" className="mt-4">
          <MatchCourtTab court={match.court} />
        </TabsContent>

        <TabsContent value="participants" className="mt-4">
          <MatchParticipantsTab participants={match.participants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
