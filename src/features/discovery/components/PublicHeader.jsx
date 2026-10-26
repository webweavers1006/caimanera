import Link from "next/link";
import { LayoutDashboard, LogOut, Trophy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/features/shared";
import { logoutAction } from "@/features/auth/actions/auth.logout.action";

/**
 * Lightweight public header. The admin shell is intentionally not used here.
 */
export function PublicHeader({ session = null, isManager = false }) {
  const accountHref = session ? (isManager ? "/admin" : "/admin/perfil") : "/login";
  const accountLabel = session ? (isManager ? "Ir al panel" : "Mi perfil") : "Ingresar";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.name} className="size-8 rounded-xl sm:size-9" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">{SITE_CONFIG.name}</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              {SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#partidos" className="transition-colors hover:text-foreground">
            Partidos
          </Link>
          {session && (
            <Link href="/mis-partidos" className="transition-colors hover:text-foreground">
              Mis partidos
            </Link>
          )}
          <Link href="/#canchas" className="transition-colors hover:text-foreground">
            Canchas
          </Link>
          <Link href="/#como-funciona" className="transition-colors hover:text-foreground">
            Cómo funciona
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/#partidos"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:flex"
          >
            <Trophy className="size-4" />
            Explorar
          </Link>
          <Button asChild size="sm" className="gap-2 rounded-full">
            <Link href={accountHref} aria-label={accountLabel}>
              {session ? (
                <LayoutDashboard className="size-4" />
              ) : (
                <UserRound className="size-4" />
              )}
              <span className="hidden sm:inline">{accountLabel}</span>
            </Link>
          </Button>
          {session && (
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
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
