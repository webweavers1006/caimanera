import Link from "next/link";
import { WifiOff } from "lucide-react";
import { SITE_CONFIG, ROUTES, PWA_CONFIG } from "@/features/shared";

export const dynamic = "force-static";

export const metadata = {
  title: `${PWA_CONFIG.UI.OFFLINE_TITLE} · ${SITE_CONFIG.name}`,
  robots: { index: false, follow: false },
};

/**
 * Offline fallback served by the service worker when a navigation fails.
 * It is static, public and free of session providers so it can be precached.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-[max(1.5rem,env(safe-area-inset-top))] text-center">
      <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <WifiOff className="size-7" />
        </span>

        <h1 className="mt-5 text-xl font-bold tracking-tight">
          {PWA_CONFIG.UI.OFFLINE_TITLE}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {PWA_CONFIG.UI.OFFLINE_DESCRIPTION(SITE_CONFIG.name)}
        </p>

        <Link
          href={ROUTES.PLAYER.HOME.path}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          {PWA_CONFIG.UI.OFFLINE_ACTION}
        </Link>
      </div>
    </main>
  );
}
