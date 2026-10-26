import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { fetchMyUpcomingMatches } from "../services/player.read.service";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { ROUTES } from "@/features/shared";
import { MyMatchesView } from "./MyMatchesView";

/**
 * Player-facing "Mis partidos". Lives in the public shell and requires a
 * session, but never touches the administrative panel.
 */
export async function MyMatchesPageContainer() {
  const jwtSession = await getSession();
  if (!jwtSession) {
    redirect(`/login?next=${encodeURIComponent(ROUTES.PLAYER.MY_MATCHES.path)}`);
  }

  const session = await validateSessionUser(jwtSession);
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(ROUTES.PLAYER.MY_MATCHES.path)}`);
  }

  let matches;

  try {
    matches = await fetchMyUpcomingMatches(session.id);
  } catch (error) {
    logger.error("Error loading player matches", { error: error.message });
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <ErrorAlert
          title="No pudimos cargar tus partidos"
          message="Intenta recargar la página en unos segundos."
        />
      </div>
    );
  }

  return <MyMatchesView matches={matches} />;
}
