import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { getUserPermissions } from "@/features/permissions/services/permission.authorization.service";
import { PublicHeader } from "@/features/discovery/components/PublicHeader";
import { PublicFooter } from "@/features/discovery/components/PublicFooter";
import { PublicBottomNav } from "@/features/discovery/components/PublicBottomNav";

/**
 * Public shell — discovery and match detail pages.
 * No session is required; authenticated users get account shortcuts.
 */
export default async function PublicLayout({ children }) {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;
  const permissions = session ? await getUserPermissions(session.role) : [];
  const isManager = permissions.includes("matches:create");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader session={session} isManager={isManager} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <PublicFooter session={session} />
      <PublicBottomNav session={session} />
    </div>
  );
}
