"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Plus,
  Trophy,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_CONFIG } from "../config/dashboard.constants";

const QUICK_ACTIONS = [
  {
    label: "Crear partido",
    description: "Programa un nuevo encuentro",
    href: "/admin/partidos",
    icon: Plus,
  },
  {
    label: "Registrar cancha",
    description: "Suma un nuevo escenario",
    href: "/admin/canchas",
    icon: Warehouse,
  },
  {
    label: "Ver inscripciones",
    description: "Revisa quién está jugando",
    href: "/admin/participantes",
    icon: UserPlus,
  },
  {
    label: "Gestionar pases",
    description: "Planes y suscripciones",
    href: "/admin/suscripciones",
    icon: CreditCard,
  },
];

export function DashboardView({ stats }) {
  const { LABELS } = DASHBOARD_CONFIG.UI;
  const upcoming = stats.upcomingMatches || [];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)] p-6 text-primary-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{DASHBOARD_CONFIG.TITLE}</h1>
          <p className="mt-1 text-sm text-white/80">{LABELS.DESCRIPTION}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/">
              Ver app pública
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white/15 hover:bg-white/25">
            <Link href="/admin/partidos">Gestionar partidos</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Warehouse} title={LABELS.STATS.COURTS} value={stats.courts} />
        <StatCard icon={Trophy} title={LABELS.STATS.MATCHES} value={stats.matches} />
        <StatCard icon={CalendarCheck} title={LABELS.STATS.OPEN_MATCHES} value={stats.openMatches} variant="open" />
        <StatCard icon={Users} title={LABELS.STATS.PARTICIPANTS} value={stats.participants} />
        <StatCard icon={CreditCard} title={LABELS.STATS.ACTIVE_SUBSCRIPTIONS} value={stats.activeSubscriptions} variant="closed" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">Próximos partidos</h2>
              <p className="text-xs text-muted-foreground">Agenda de los siguientes encuentros.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/partidos" className="gap-1.5">
                Ver todos
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No hay partidos próximos.{" "}
              <Link href="/admin/partidos" className="font-medium text-primary hover:underline">
                Crea el primero
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y">
              {upcoming.map((match) => {
                const filled = match.capacity > 0
                  ? Math.min(100, (match.confirmed / match.capacity) * 100)
                  : 0;
                return (
                  <li key={match.id}>
                    <Link
                      href={`/admin/partidos/${match.id}`}
                      className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/40"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CalendarDays className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{match.title}</span>
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {match.sport}
                          </Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {match.dateLabel} · {match.timeLabel} · {match.courtName}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <span
                              className={`block h-full rounded-full ${filled >= 100 ? "bg-amber-500" : "bg-primary"}`}
                              style={{ width: `${filled}%` }}
                            />
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {match.confirmed}/{match.capacity}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Accesos rápidos</h2>
          <p className="mb-4 text-xs text-muted-foreground">Lo que más se usa en el día a día.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{action.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
