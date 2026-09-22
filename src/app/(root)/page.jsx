import { Suspense } from "react";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageContainer";
import { DASHBOARD_CONFIG } from "@/features/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `${DASHBOARD_CONFIG.TITLE} | Caimanera`,
  description: DASHBOARD_CONFIG.METADATA.DESCRIPTION,
};

export default async function DashboardPage({ searchParams }) {
  const { authorized } = await checkPageAccess();

  if (!authorized) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<TableSkeleton />}>
      <DashboardPageContainer searchParams={searchParams} />
    </Suspense>
  );
}
