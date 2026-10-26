import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { PlayerPassPageContainer } from "@/features/subscriptions/components/player/PlayerPassPageContainer";
import { SITE_CONFIG, ROUTES } from "@/features/shared";

export const metadata = {
  title: `Mi pase | ${SITE_CONFIG.name}`,
  description: "Consulta, compra o renueva tu pase de jugador.",
  robots: { index: false, follow: false },
};

export default async function AccountPassPage() {
  const loginHref = `/login?next=${encodeURIComponent(ROUTES.PLAYER.PASSES.path)}`;
  const jwtSession = await getSession();
  if (!jwtSession) redirect(loginHref);

  const session = await validateSessionUser(jwtSession);
  if (!session) redirect(loginHref);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <PlayerPassPageContainer userId={session.id} />
    </div>
  );
}
