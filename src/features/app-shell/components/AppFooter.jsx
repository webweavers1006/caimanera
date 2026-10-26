import Link from "next/link";
import { SITE_CONFIG, ROUTES } from "@/features/shared";
import { APP_SHELL_CONFIG } from "../config/app-shell.constants";

const LABELS = APP_SHELL_CONFIG.UI.FOOTER;

export function AppFooter({ session = null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 hidden border-t border-border/70 bg-card md:block">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.name} className="size-8 rounded-lg" />
            <span className="font-bold">{SITE_CONFIG.name}</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{LABELS.TAGLINE}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {LABELS.EXPLORE}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={ROUTES.PUBLIC.MATCHES.path} className="text-muted-foreground hover:text-foreground">
                {APP_SHELL_CONFIG.UI.NAV.MATCHES}
              </Link>
            </li>
            <li>
              <Link href="/#canchas" className="text-muted-foreground hover:text-foreground">
                {APP_SHELL_CONFIG.UI.NAV.COURTS}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {LABELS.ACCOUNT}
          </p>
          <ul className="space-y-2 text-sm">
            {!session && (
              <li>
                <Link href={ROUTES.AUTH.LOGIN.path} className="text-muted-foreground hover:text-foreground">
                  {APP_SHELL_CONFIG.UI.NAV.LOGIN}
                </Link>
              </li>
            )}
            {session && (
              <>
                <li>
                  <Link
                    href={ROUTES.PLAYER.MY_MATCHES.path}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {APP_SHELL_CONFIG.UI.NAV.MY_MATCHES}
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.PLAYER.ACCOUNT.path}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {APP_SHELL_CONFIG.UI.NAV.ACCOUNT}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {LABELS.LEGAL}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={ROUTES.LEGAL.TERMS.path} className="text-muted-foreground hover:text-foreground">
                {LABELS.TERMS}
              </Link>
            </li>
            <li>
              <Link href={ROUTES.LEGAL.PRIVACY.path} className="text-muted-foreground hover:text-foreground">
                {LABELS.PRIVACY}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        {LABELS.RIGHTS(year)}
      </div>
    </footer>
  );
}
