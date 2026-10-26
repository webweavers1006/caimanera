import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { RolePageContainer } from "@/features/roles/components/RolePageContainer";
import { ROLE_CONFIG } from "@/features/roles";

const { LABELS } = ROLE_CONFIG.UI;

export const metadata = {
  title: `${ROLE_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function RolesPage({ searchParams }) {
  const { authorized } = await checkPageAccess(ROLE_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><RolePageContainer searchParams={searchParams} /></Suspense>;
}
