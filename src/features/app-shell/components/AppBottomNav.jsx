"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Trophy, UserRound } from "lucide-react";
import { ROUTES } from "@/features/shared";
import { APP_SHELL_CONFIG } from "../config/app-shell.constants";

const LABELS = APP_SHELL_CONFIG.UI.NAV;

const ITEMS = [
  {
    label: LABELS.HOME,
    href: ROUTES.PLAYER.HOME.path,
    icon: Home,
    active: (pathname) => pathname === ROUTES.PLAYER.HOME.path,
  },
  {
    label: LABELS.MATCHES,
    href: ROUTES.PUBLIC.MATCHES.path,
    icon: Trophy,
    active: (pathname) => pathname.startsWith(ROUTES.PUBLIC.MATCHES.path),
  },
  {
    label: LABELS.MY_MATCHES,
    href: ROUTES.PLAYER.MY_MATCHES.path,
    icon: CalendarCheck,
    active: (pathname) => pathname.startsWith(ROUTES.PLAYER.MY_MATCHES.path),
  },
];

/**
 * Mobile app-style bottom navigation for the player surface.
 * Administrative links intentionally never appear here.
 */
export function AppBottomNav({ session = null }) {
  const pathname = usePathname();
  const accountHref = session ? ROUTES.PLAYER.ACCOUNT.path : ROUTES.AUTH.LOGIN.path;
  const accountLabel = session ? LABELS.ACCOUNT : LABELS.LOGIN;
  const accountActive = session
    ? pathname.startsWith(ROUTES.PLAYER.ACCOUNT.path)
    : pathname.startsWith(ROUTES.AUTH.LOGIN.path);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 px-2 pt-1.5">
        {ITEMS.map((item) => {
          const active = item.active(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                  active ? "bg-primary/15" : ""
                }`}
              >
                <Icon className="size-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
        <Link
          href={accountHref}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors ${
            accountActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <span
            className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
              accountActive ? "bg-primary/15" : ""
            }`}
          >
            <UserRound className="size-5" />
          </span>
          {accountLabel}
        </Link>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
