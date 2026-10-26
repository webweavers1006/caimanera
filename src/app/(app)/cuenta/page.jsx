import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { ProfilePageContainer } from "@/features/profile/components/ProfilePageContainer";
import { SITE_CONFIG, ROUTES } from "@/features/shared";

export const metadata = {
  title: `Mi cuenta | ${SITE_CONFIG.name}`,
  description: "Consulta tus datos de cuenta y cambia tu contraseña.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const loginHref = `/login?next=${encodeURIComponent(ROUTES.PLAYER.ACCOUNT.path)}`;
  const jwtSession = await getSession();
  if (!jwtSession) redirect(loginHref);

  const session = await validateSessionUser(jwtSession);
  if (!session) redirect(loginHref);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <ProfilePageContainer session={session} />
    </div>
  );
}
