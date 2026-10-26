import Link from "next/link";
import { SITE_CONFIG, ROUTES, LANDING_CONFIG } from "@/features/shared";
import { APP_SHELL_CONFIG } from "../config/app-shell.constants";

const LABELS = APP_SHELL_CONFIG.UI.FOOTER;
const LEGAL_LINK_CLASS = "text-muted-foreground hover:text-foreground";

function loginHref(nextPath) {
  return `${ROUTES.AUTH.LOGIN.path}?next=${encodeURIComponent(nextPath)}`;
}

export function AppFooter({ session = null }) {
  const year = new Date().getFullYear();
  const hasLegalLinks = Boolean(LANDING_CONFIG.termsUrl || LANDING_CONFIG.privacyUrl);
  const matchesHref = session
    ? ROUTES.PUBLIC.MATCHES.path
    : loginHref(ROUTES.PUBLIC.MATCHES.path);
  const courtsHref = session
    ? ROUTES.PUBLIC.COURTS.path
    : loginHref(ROUTES.PUBLIC.COURTS.path);

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
              <Link href={matchesHref} className="text-muted-foreground hover:text-foreground">
                {APP_SHELL_CONFIG.UI.NAV.MATCHES}
              </Link>
            </li>
            <li>
              <Link href={courtsHref} className="text-muted-foreground hover:text-foreground">
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

        {hasLegalLinks && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {LABELS.LEGAL}
            </p>
            <ul className="space-y-2 text-sm">
              {LANDING_CONFIG.termsUrl && (
                <li>
                  <a
                    href={LANDING_CONFIG.termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LEGAL_LINK_CLASS}
                  >
                    {LABELS.TERMS}
                  </a>
                </li>
              )}
              {LANDING_CONFIG.privacyUrl && (
                <li>
                  <a
                    href={LANDING_CONFIG.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LEGAL_LINK_CLASS}
                  >
                    {LABELS.PRIVACY}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        {LABELS.RIGHTS(year)}
      </div>
    </footer>
  );
}
