import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { AppHeader } from "@/features/app-shell/components/AppHeader";
import { AppFooter } from "@/features/app-shell/components/AppFooter";
import { AppBottomNav } from "@/features/app-shell/components/AppBottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

/**
 * Player-facing app shell — discovery, venues, match detail and player pages.
 * No administrative navigation or permissions are resolved here.
 */
export default async function AppLayout({ children }) {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader session={session} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <AppFooter session={session} />
      <AppBottomNav session={session} />
      <OfflineBanner />
    </div>
  );
}
