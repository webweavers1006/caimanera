import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { logger } from "@/features/shared/lib/logger";
import { ROUTES } from "@/features/shared";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchHomeData } from "../services/home.read.service";
import { HomeView } from "./HomeView";

/**
 * Player home: a personal start page, never a match search.
 * Anonymous visitors never reach this container (the proxy sends them to
 * `/partidos`), but the session is still validated against the database.
 */
export async function HomePageContainer() {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;

  if (!session) redirect(ROUTES.PUBLIC.MATCHES.path);

  let data;

  try {
    data = await fetchHomeData({ userId: session.id });
  } catch (error) {
    logger.error("Error loading player home", { error: error.message });
    return (
      <ErrorAlert
        title="No pudimos cargar tu inicio"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return (
    <HomeView
      matches={data.matches}
      courts={data.courts}
      userName={session.firstName || null}
    />
  );
}
