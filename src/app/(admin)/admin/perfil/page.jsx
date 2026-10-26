import { getSession } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { PROFILE_CONFIG } from "@/features/profile";
import { ProfilePageContainer } from "@/features/profile/components/ProfilePageContainer";

export const metadata = {
  title: `${PROFILE_CONFIG.TITLE} | Caimanera`,
  description: PROFILE_CONFIG.UI.LABELS.DESCRIPTION,
};

/**
 * Profile page — requires authentication only (no specific RBAC permission).
 * Any authenticated user can view their own account and change their password.
 */
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ProfilePageContainer session={session} />;
}
