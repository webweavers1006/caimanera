import Link from "next/link";
import { ArrowRight, ReceiptText, Ticket, UserRound } from "lucide-react";
import { ROUTES } from "@/features/shared";
import { InstallAppButton } from "@/components/shared/InstallAppButton";
import { PLAYER_CONFIG } from "../config/player.constants";

const labels = PLAYER_CONFIG.ACCOUNT;

function AccountCard({ href, icon: Icon, title, description, meta = null }) {
  return (
    <Link
      href={href}
      className="group flex min-h-28 flex-col justify-between rounded-3xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div className="mt-3">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {meta || description}
        </p>
      </div>
    </Link>
  );
}

export function AccountHub({
  session,
  activePass = null,
  activePassCount = 0,
  activePassCredits = 0,
}) {
  const passMeta =
    activePassCount > 1
      ? labels.PASS_MULTIPLE(activePassCount, activePassCredits)
      : activePass
        ? labels.PASS_ACTIVE(activePass.planName, activePass.remainingMatches)
        : labels.PASS_EMPTY;

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {labels.EYEBROW}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
          {labels.GREETING(session?.firstName)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{labels.SUBTITLE}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <AccountCard
          href={ROUTES.PLAYER.PASSES.path}
          icon={Ticket}
          title={labels.PASS_TITLE}
          description={labels.PASS_DESCRIPTION}
          meta={passMeta}
        />
        <AccountCard
          href={ROUTES.PLAYER.PAYMENTS.path}
          icon={ReceiptText}
          title={labels.PAYMENTS_TITLE}
          description={labels.PAYMENTS_DESCRIPTION}
        />
        <AccountCard
          href="#perfil"
          icon={UserRound}
          title={labels.PROFILE_TITLE}
          description={labels.PROFILE_DESCRIPTION}
        />
      </div>

      <InstallAppButton />
    </section>
  );
}
