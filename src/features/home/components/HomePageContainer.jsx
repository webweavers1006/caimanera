import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchHomeData } from "../services/home.read.service";
import { HomeView } from "./HomeView";

/**
 * Player home: a personal start page for authenticated players and a public
 * landing for visitors. The proxy lets anonymous visitors through, so the
 * container always renders the shell; personal sections are hidden in guest
 * mode.
 */
export async function HomePageContainer() {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;

  let data;

  try {
    data = await fetchHomeData({ userId: session?.id || null });
  } catch (error) {
    logger.error("Error loading home", { error: error.message });
    return (
      <ErrorAlert
        title="No pudimos cargar el inicio"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return (
    <HomeView
      matches={data.matches}
      courts={data.courts}
      userName={session?.firstName || null}
      isGuest={!session}
    />
  );
}
