import { notFound } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { getBookingCapabilities } from "@/features/booking/services/booking.authorization.service";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchMatchDetailPageData } from "../services/match-detail.read.service";
import { MatchDetailView } from "./MatchDetailView";

export async function MatchDetailPageContainer({ matchId }) {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;
  const { canStaffConfirm } = await getBookingCapabilities(session);

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
      canStaffConfirm={canStaffConfirm}
    />
  );
}
