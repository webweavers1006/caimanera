import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { PlayerPaymentsPageContainer } from "@/features/payments/components/player/PlayerPaymentsPageContainer";
import { SITE_CONFIG, ROUTES } from "@/features/shared";

export const metadata = {
  title: `Mis pagos | ${SITE_CONFIG.name}`,
  description: "Historial de pagos de partidos y pases.",
  robots: { index: false, follow: false },
};

export default async function AccountPaymentsPage() {
  const loginHref = `/login?next=${encodeURIComponent(ROUTES.PLAYER.PAYMENTS.path)}`;
  const jwtSession = await getSession();
  if (!jwtSession) redirect(loginHref);

  const session = await validateSessionUser(jwtSession);
  if (!session) redirect(loginHref);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <PlayerPaymentsPageContainer userId={session.id} />
    </div>
  );
}
