import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { getUserPermissions } from "@/features/permissions/services/permission.authorization.service";
import { fetchDiscoveryData } from "@/features/discovery/services/discovery.read.service";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";
import { DiscoveryView } from "./DiscoveryView";

/**
 * Public discovery page container. Works for anonymous visitors and
 * authenticated players alike; personalization is resolved server-side.
 */
export async function DiscoveryPageContainer() {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;
  const permissions = session ? await getUserPermissions(session.role) : [];
  let data;

  try {
    data = await fetchDiscoveryData({ currentUserId: session?.id || null });
  } catch (error) {
    logger.error("Error loading public discovery", { error: error.message });
    return (
      <ErrorAlert
        title="No pudimos cargar los partidos"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return (
    <DiscoveryView
      matches={data.matches}
      courts={data.courts}
      subscription={data.subscription}
      isAuthenticated={Boolean(session)}
      userName={session?.firstName || null}
      canStaffConfirm={permissions.includes(PARTICIPANT_CONFIG.PERMISSIONS.WRITE)}
    />
  );
}
