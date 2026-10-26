import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { getUserPermissions } from "@/features/permissions/services/permission.authorization.service";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchMatchSearchData } from "../services/match-search.read.service";
import { MatchSearchView } from "./MatchSearchView";

/**
 * Public match search. Anonymous visitors are welcome; the session only adds
 * "my enrollment" data and a way back to the player home.
 */
export async function MatchSearchPageContainer() {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;
  const permissions = session ? await getUserPermissions(session.role) : [];

  let data;

  try {
    data = await fetchMatchSearchData({ currentUserId: session?.id || null });
  } catch (error) {
    logger.error("Error loading match search", { error: error.message });
    return (
      <ErrorAlert
        title="No pudimos cargar los partidos"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return (
    <MatchSearchView
      matches={data.matches}
      courts={data.courts}
      subscription={data.subscription}
      isAuthenticated={Boolean(session)}
      canStaffConfirm={permissions.includes(PARTICIPANT_CONFIG.PERMISSIONS.WRITE)}
    />
  );
}
