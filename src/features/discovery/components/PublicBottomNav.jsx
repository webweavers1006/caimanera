"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Trophy, UserRound } from "lucide-react";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

const ITEMS = [
  {
    label: "Inicio",
    href: "/",
    icon: Home,
    active: (pathname, hash) => pathname === "/" && hash !== "#partidos",
  },
  {
    label: "Partidos",
    href: "/#partidos",
    icon: Trophy,
    active: (pathname, hash) =>
      pathname.startsWith("/partidos") || (pathname === "/" && hash === "#partidos"),
  },
  {
    label: "Mis partidos",
    href: DISCOVERY_CONFIG.PATHS.MY_MATCHES,
    icon: CalendarCheck,
    active: (pathname) => pathname.startsWith(DISCOVERY_CONFIG.PATHS.MY_MATCHES),
  },
];

export function PublicBottomNav({ session = null }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const accountHref = session ? "/admin/perfil" : "/login";

  // The match picker lives on "/" behind #partidos, so the highlighted tab
  // needs the hash as well as the pathname.
  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 px-2 pt-1.5">
        {ITEMS.map((item) => {
          const active = item.active(pathname, hash);
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
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold text-muted-foreground transition-colors"
        >
          <span className="flex size-8 items-center justify-center rounded-xl">
            <UserRound className="size-5" />
          </span>
          {session ? "Perfil" : "Ingresar"}
        </Link>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
