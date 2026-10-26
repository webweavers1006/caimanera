"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Warehouse, UserPlus, CreditCard } from "lucide-react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { ROUTES } from "@/features/shared";

const ITEMS = [
  {
    label: "Partidos",
    href: ROUTES.PLAYMATCH.MATCHES.path,
    icon: Trophy,
    permission: ROUTES.PLAYMATCH.MATCHES.permission,
    isActive: (pathname) => pathname.startsWith(ROUTES.PLAYMATCH.MATCHES.path),
  },
  {
    label: "Canchas",
    href: ROUTES.PLAYMATCH.COURTS.path,
    icon: Warehouse,
    permission: ROUTES.PLAYMATCH.COURTS.permission,
    isActive: (pathname) => pathname.startsWith(ROUTES.PLAYMATCH.COURTS.path),
  },
  {
    label: "Jugadores",
    href: ROUTES.PLAYMATCH.PARTICIPANTS.path,
    icon: UserPlus,
    permission: ROUTES.PLAYMATCH.PARTICIPANTS.permission,
    isActive: (pathname) => pathname.startsWith(ROUTES.PLAYMATCH.PARTICIPANTS.path),
  },
  {
    label: "Pases",
    href: ROUTES.PLAYMATCH.SUBSCRIPTIONS.path,
    icon: CreditCard,
    permission: ROUTES.PLAYMATCH.SUBSCRIPTIONS.permission,
    isActive: (pathname) => pathname.startsWith(ROUTES.PLAYMATCH.SUBSCRIPTIONS.path),
  },
];

/**
 * Mobile app-style bottom navigation bar.
 * Visible only on small screens (hidden on md+ where the sidebar is used).
 */
export function MobileBottomNav() {
  const { can } = usePermission();
  const pathname = usePathname();

  const homeItem = {
    label: "Panel",
    href: ROUTES.DASHBOARD.path,
    icon: LayoutDashboard,
    isActive: (value) => value === ROUTES.DASHBOARD.path,
  };

  const items = [
    homeItem,
    ...ITEMS.filter((item) => !item.permission || can(item.permission)),
  ].slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
