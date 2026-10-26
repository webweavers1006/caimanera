import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { ProfilePageContainer } from "@/features/profile/components/ProfilePageContainer";
import { AccountHub } from "@/features/player/components/AccountHub";
import { fetchPlayerPassData } from "@/features/subscriptions/services/player-subscription.read.service";
import { logger } from "@/features/shared/lib/logger";
import { SITE_CONFIG, ROUTES } from "@/features/shared";

export const metadata = {
  title: `Mi cuenta | ${SITE_CONFIG.name}`,
  description: "Consulta tus datos, tu pase y tus pagos.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const loginHref = `/login?next=${encodeURIComponent(ROUTES.PLAYER.ACCOUNT.path)}`;
  const jwtSession = await getSession();
  if (!jwtSession) redirect(loginHref);

  const session = await validateSessionUser(jwtSession);
  if (!session) redirect(loginHref);

  let activePass = null;
  let activePassCount = 0;
  let activePassCredits = 0;
  try {
    const passData = await fetchPlayerPassData(session.id);
    activePass = passData.active;
    activePassCount = passData.activePasses.length;
    activePassCredits = passData.activePasses.reduce(
      (total, pass) => total + Number(pass.remainingMatches || 0),
      0
    );
  } catch (error) {
    logger.error("Error loading account pass summary", {
      error: error.message,
      userId: session.id,
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
      <AccountHub
        session={session}
        activePass={activePass}
        activePassCount={activePassCount}
        activePassCredits={activePassCredits}
      />

      <div id="perfil" className="scroll-mt-24">
        <ProfilePageContainer session={session} />
      </div>
    </div>
  );
}
