import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { UserPageContainer } from "@/features/users/components/UserPageContainer";
import { USER_CONFIG } from "@/features/users";

const { LABELS } = USER_CONFIG.UI;

export const metadata = {
  title: `${USER_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function UsersPage({ searchParams }) {
  const { authorized, session } = await checkPageAccess(USER_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><UserPageContainer session={session} searchParams={searchParams} /></Suspense>;
}
