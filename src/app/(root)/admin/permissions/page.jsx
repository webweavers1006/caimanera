import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { PermissionPageContainer } from "@/features/permissions/components/PermissionPageContainer";
import { PERMISSION_CONFIG } from "@/features/permissions";

const { LABELS } = PERMISSION_CONFIG.UI;

export const metadata = {
  title: `${PERMISSION_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function PermissionsPage({ searchParams }) {
  const { authorized } = await checkPageAccess(PERMISSION_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<TableSkeleton />}>
      <PermissionPageContainer searchParams={searchParams} />
    </Suspense>
  );
}
