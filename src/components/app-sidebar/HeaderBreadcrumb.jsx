"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS = {
  admin: "Panel",
  partidos: "Partidos",
  canchas: "Canchas",
  participantes: "Jugadores",
  suscripciones: "Pases",
  pagos: "Pagos",
  users: "Usuarios",
  roles: "Roles",
  permissions: "Permisos",
  auditoria: "Auditoría",
  perfil: "Mi perfil",
  "sse-monitor": "Monitor SSE",
  "bloqueos-login": "Bloqueos de login",
  paises: "Países",
};

function isId(segment) {
  return /^[0-9a-f-]{16,}$/i.test(segment) || segment.length > 24;
}

/**
 * Compact breadcrumb for the admin header.
 */
export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [];

  segments.forEach((segment, index) => {
    if (isId(segment)) {
      crumbs.push({
        label: index === segments.length - 1 ? "Detalle" : "Detalle",
        href: `/${segments.slice(0, index + 1).join("/")}`,
      });
      return;
    }

    crumbs.push({
      label: LABELS[segment] || segment.replace(/-/g, " "),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    });
  });

  const current = crumbs[crumbs.length - 1];

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Link
        href="/admin"
        className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        aria-label="Panel"
      >
        <Home className="size-4" />
      </Link>
      {crumbs.slice(0, -1).map((crumb, index) => (
        <span key={`${crumb.href}-${index}`} className="hidden items-center gap-2 sm:flex">
          <ChevronRight className="size-3.5 text-muted-foreground/60" />
          <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
            {crumb.label}
          </Link>
        </span>
      ))}
      {current && (
        <>
          <ChevronRight className="hidden size-3.5 text-muted-foreground/60 sm:block" />
          <span className="truncate font-medium text-foreground">{current.label}</span>
        </>
      )}
    </div>
  );
}
