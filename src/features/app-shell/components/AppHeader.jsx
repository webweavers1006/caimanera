import Link from "next/link";
import { LayoutDashboard, LogOut, Trophy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG, ROUTES } from "@/features/shared";
import { isManagementRole } from "@/features/auth/config/auth.constants";
import { logoutAction } from "@/features/auth/actions/auth.logout.action";
import { APP_SHELL_CONFIG } from "../config/app-shell.constants";

const LABELS = APP_SHELL_CONFIG.UI.NAV;

function loginHref(nextPath) {
  return `${ROUTES.AUTH.LOGIN.path}?next=${encodeURIComponent(nextPath)}`;
}

/**
 * Player-facing app header. Administrative navigation lives in the admin shell.
 */
export function AppHeader({ session = null }) {
  const isStaff = Boolean(session && isManagementRole(session.role));
  const matchesHref = session
    ? ROUTES.PUBLIC.MATCHES.path
    : loginHref(ROUTES.PUBLIC.MATCHES.path);
  const courtsHref = session
    ? ROUTES.PUBLIC.COURTS.path
    : loginHref(ROUTES.PUBLIC.COURTS.path);
  const accountHref = session
    ? isStaff
      ? ROUTES.DASHBOARD.path
      : ROUTES.PLAYER.ACCOUNT.path
    : ROUTES.AUTH.LOGIN.path;
  const accountLabel = session
    ? isStaff
      ? LABELS.DASHBOARD
      : LABELS.ACCOUNT
    : LABELS.LOGIN;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:h-16">
        <Link href={ROUTES.PLAYER.HOME.path} className="flex items-center gap-2.5">
          <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.name} className="size-8 rounded-xl sm:size-9" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">{SITE_CONFIG.name}</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              {SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href={matchesHref} className="transition-colors hover:text-foreground">
            {LABELS.MATCHES}
          </Link>
          {session && (
            <Link href={ROUTES.PLAYER.MY_MATCHES.path} className="transition-colors hover:text-foreground">
              {LABELS.MY_MATCHES}
            </Link>
          )}
          <Link href={courtsHref} className="transition-colors hover:text-foreground">
            {LABELS.COURTS}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={matchesHref}
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:flex"
          >
            <Trophy className="size-4" />
            {LABELS.EXPLORE}
          </Link>
          <Button asChild size="sm" className="gap-2 rounded-full">
            <Link href={accountHref} aria-label={accountLabel}>
              {isStaff ? <LayoutDashboard className="size-4" /> : <UserRound className="size-4" />}
              <span className="hidden sm:inline">{accountLabel}</span>
            </Link>
          </Button>
          {session && (
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label={LABELS.LOGOUT}
                title={LABELS.LOGOUT}
                className="rounded-full"
              >
                <LogOut />
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
