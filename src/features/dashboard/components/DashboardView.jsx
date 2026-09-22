"use client";

import { Warehouse, Trophy, CalendarCheck, Users, CreditCard } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { DASHBOARD_CONFIG } from "../config/dashboard.constants";

export function DashboardView({ stats }) {
  const { LABELS } = DASHBOARD_CONFIG.UI;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)] p-6 text-primary-foreground shadow-sm">
        <h1 className="text-2xl font-bold leading-tight">{DASHBOARD_CONFIG.TITLE}</h1>
        <p className="mt-1 text-sm text-white/80">{LABELS.DESCRIPTION}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Warehouse} title={LABELS.STATS.COURTS} value={stats.courts} />
        <StatCard icon={Trophy} title={LABELS.STATS.MATCHES} value={stats.matches} />
        <StatCard icon={CalendarCheck} title={LABELS.STATS.OPEN_MATCHES} value={stats.openMatches} variant="open" />
        <StatCard icon={Users} title={LABELS.STATS.PARTICIPANTS} value={stats.participants} />
        <StatCard icon={CreditCard} title={LABELS.STATS.ACTIVE_SUBSCRIPTIONS} value={stats.activeSubscriptions} variant="closed" />
      </div>
    </div>
  );
}
