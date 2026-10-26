import Link from "next/link";
import { SITE_CONFIG } from "@/features/shared";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

export function PublicFooter({ session = null }) {
  const labels = DISCOVERY_CONFIG.UI.FOOTER;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 hidden border-t border-border/70 bg-card md:block">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.name} className="size-8 rounded-lg" />
            <span className="font-bold">{SITE_CONFIG.name}</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{labels.TAGLINE}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.EXPLORE}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#partidos" className="text-muted-foreground hover:text-foreground">
                Partidos
              </Link>
            </li>
            <li>
              <Link href="/#canchas" className="text-muted-foreground hover:text-foreground">
                Canchas
              </Link>
            </li>
            <li>
              <Link href="/#como-funciona" className="text-muted-foreground hover:text-foreground">
                Cómo funciona
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.ACCOUNT}
          </p>
          <ul className="space-y-2 text-sm">
            {!session && (
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                </Link>
              </li>
            )}
            {session && (
              <>
                <li>
                  <Link href="/mis-partidos" className="text-muted-foreground hover:text-foreground">
                    Mis partidos
                  </Link>
                </li>
                <li>
                  <Link href="/admin/perfil" className="text-muted-foreground hover:text-foreground">
                    Mi perfil
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.LEGAL}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/terminos" className="text-muted-foreground hover:text-foreground">
                Términos de servicio
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="text-muted-foreground hover:text-foreground">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        {labels.RIGHTS(year)}
      </div>
    </footer>
  );
}
