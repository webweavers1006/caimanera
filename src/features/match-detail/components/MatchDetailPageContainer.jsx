import { notFound } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { getUserPermissions } from "@/features/permissions/services/permission.authorization.service";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchMatchDetailPageData } from "../services/match-detail.read.service";
import { MatchDetailView } from "./MatchDetailView";

export async function MatchDetailPageContainer({ matchId }) {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;
  const permissions = session ? await getUserPermissions(session.role) : [];

  let data;

  try {
    data = await fetchMatchDetailPageData(matchId, session?.id || null);
  } catch (error) {
    logger.error("Error loading public match detail page", {
      error: error.message,
      matchId,
    });
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorAlert
          title="No pudimos cargar el partido"
          message="Intenta recargar la página o vuelve al inicio."
        />
      </div>
    );
  }

  if (!data.match) notFound();

  return (
    <MatchDetailView
      match={data.match}
      isAuthenticated={Boolean(session)}
      subscription={data.subscription}
      canStaffConfirm={permissions.includes(PARTICIPANT_CONFIG.PERMISSIONS.WRITE)}
    />
  );
}
