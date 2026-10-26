import { SHARED_CONFIG } from "@/features/shared";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { logger } from "@/features/shared/lib/logger";
import { MATCH_CONFIG } from "@/features/matches/config/match.constants";
import { fetchMatchDetail } from "@/features/matches/services/match.read.service";
import { MatchDetailView } from "./MatchDetailView";
import { MatchDetailActions } from "./MatchDetailActions";

export async function MatchDetailPageContainer({ matchId, session, canViewParticipants = true }) {
  let match;

  try {
    match = await fetchMatchDetail(matchId, session?.id || null, canViewParticipants);
  } catch (error) {
    logger.error("Error loading match detail", { error: error.message, matchId });
    return (
      <ErrorAlert
        title={SHARED_CONFIG.UI.LABELS.MESSAGES.ERROR_TITLE}
        message={MATCH_CONFIG.UI.LABELS.MESSAGES.ERROR.LOAD}
      />
    );
  }

  if (!match) {
    return (
      <ErrorAlert
        title={MATCH_CONFIG.UI.LABELS.MESSAGES.ERROR.NOT_FOUND}
        message={MATCH_CONFIG.UI.LABELS.MESSAGES.ERROR.NOT_FOUND}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <a
            href={MATCH_CONFIG.PATH}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {MATCH_CONFIG.UI.LABELS.DETAIL.BREADCRUMB_BACK}
          </a>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold tracking-tight">{match.title}</h1>
        </div>
        <MatchDetailActions match={match} />
      </div>

      <MatchDetailView
        match={match}
        isAuthenticated={Boolean(session)}
        canViewParticipants={canViewParticipants}
        loginPath={`${MATCH_CONFIG.PATH}/${match.id}`}
      />
    </div>
  );
}
