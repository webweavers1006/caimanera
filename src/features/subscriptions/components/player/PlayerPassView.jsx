"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  Clock3,
  CreditCard,
  History,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, cn } from "@/features/shared";
import { formatPrice } from "@/features/shared/lib/format";
import { formatDate } from "@/features/shared/lib/date-format";
import { SUBSCRIPTION_CONFIG } from "../../config/subscription.constants";
import { PassPurchaseDialog } from "./PassPurchaseDialog";

const { PLAYER } = SUBSCRIPTION_CONFIG.UI;

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-400/15 text-emerald-300",
  EXPIRED: "bg-muted text-muted-foreground",
  DEPLETED: "bg-amber-400/15 text-amber-300",
};

function PageHeaderBlock() {
  return (
    <header>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {PLAYER.EYEBROW}
      </p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{PLAYER.TITLE}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{PLAYER.SUBTITLE}</p>
    </header>
  );
}

function ActivePassCard({ active }) {
  const total = Number(active.matchesIncluded) || Number(active.remainingMatches) || 1;
  const remaining = Number(active.remainingMatches) || 0;
  const percentage = Math.max(0, Math.min(100, (remaining / total) * 100));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-5 shadow-sm sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {PLAYER.ACTIVE_TITLE}
            </p>
            <h2 className="mt-0.5 truncate text-xl font-bold tracking-tight">
              {active.planName}
            </h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            <Check className="size-3" />
            {PLAYER.STATUS.ACTIVE}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{PLAYER.CREDITS(remaining, total)}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            {PLAYER.VALID_UNTIL(formatDate(active.endDate))}
          </span>
          {active.priorityBooking && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Sparkles className="size-3.5" />
              {PLAYER.PRIORITY}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function ActivePasses({ passes = [] }) {
  if (passes.length === 0) {
    return (
      <section className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-10 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Ticket className="size-6" />
        </span>
        <h2 className="text-lg font-semibold">{PLAYER.ACTIVE_EMPTY}</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {PLAYER.ACTIVE_EMPTY_DESCRIPTION}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {passes.map((pass) => (
        <ActivePassCard key={pass.id} active={pass} />
      ))}
    </div>
  );
}

function PlanCard({ plan, isRenewal, onBuy }) {
  return (
    <div className="flex flex-col rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {PLAYER.INCLUDES(plan.matchesIncluded)}
          </p>
        </div>
        <p className="shrink-0 text-base font-bold">{formatPrice(plan.price)}</p>
      </div>

      {plan.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {plan.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {plan.priorityBooking && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="size-2.5" />
            {PLAYER.PRIORITY}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Ticket className="size-2.5" />
          {plan.matchesIncluded} partidos
        </span>
      </div>

      <Button
        type="button"
        className="mt-4 w-full gap-2 rounded-full"
        onClick={() => onBuy(plan)}
      >
        <CreditCard className="size-4" />
        {isRenewal ? PLAYER.RENEW : PLAYER.BUY}
      </Button>
    </div>
  );
}

function PendingPurchases({ purchases = [] }) {
  if (purchases.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
          <Clock3 className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{PLAYER.PENDING_TITLE}</p>
          <p className="mt-0.5 text-xs text-amber-100/70">
            {PLAYER.PENDING_DESCRIPTION}
          </p>
          <ul className="mt-3 space-y-1.5">
            {purchases.map((purchase) => (
              <li
                key={purchase.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <span className="font-medium text-amber-100">
                  {purchase.planName}
                </span>
                <span className="text-amber-100/70">
                  {formatPrice(purchase.amount, { currency: purchase.currency || "USD" })}
                  {" · "}
                  {formatDate(purchase.createdAt, "dd/MM/yyyy HH:mm")}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={ROUTES.PLAYER.PAYMENTS.path}
            className="mt-3 inline-flex text-xs font-semibold text-amber-200 hover:underline"
          >
            {PLAYER.VIEW_PAYMENTS}
          </Link>
        </div>
      </div>
    </section>
  );
}

function HistoryList({ history }) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-lg font-bold tracking-tight">{PLAYER.HISTORY_TITLE}</h2>
        <p className="text-xs text-muted-foreground">{PLAYER.HISTORY_SUBTITLE}</p>
      </div>

      {history.length === 0 ? (
        <div className="flex items-center gap-3 rounded-3xl border border-dashed bg-card px-4 py-5 text-sm text-muted-foreground">
          <History className="size-5 shrink-0" />
          {PLAYER.HISTORY_EMPTY}
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.planName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {PLAYER.CREDITS_LEFT(item.remainingMatches)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    STATUS_BADGES[item.status] || "bg-muted text-muted-foreground"
                  )}
                >
                  {PLAYER.STATUS[item.status] || item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function PlayerPassView({
  active = null,
  activePasses = [],
  history = [],
  plans = [],
  pendingPurchases = [],
}) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const passes = activePasses.length > 0 ? activePasses : active ? [active] : [];

  const handleBuy = (plan) => {
    setSelectedPlan(plan);
    setPurchaseOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeaderBlock />
      <ActivePasses passes={passes} />
      <PendingPurchases purchases={pendingPurchases} />

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-lg font-bold tracking-tight">{PLAYER.PLANS_TITLE}</h2>
          <p className="text-xs text-muted-foreground">{PLAYER.PLANS_SUBTITLE}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isRenewal={passes.some((pass) => pass.planId === plan.id)}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </section>

      <HistoryList history={history} />

      <PassPurchaseDialog
        plan={selectedPlan}
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
      />
    </div>
  );
}
