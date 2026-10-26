import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { SseMonitorPageContainer } from "@/features/sse-monitor/components/SseMonitorPageContainer";
import { SSE_MONITOR_CONFIG } from "@/features/sse-monitor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const { UI } = SSE_MONITOR_CONFIG;

export const metadata = {
  title: `${SSE_MONITOR_CONFIG.TITLE} | Caimanera`,
  description: UI.LABELS.DESCRIPTION,
};

export default async function SseMonitorPage() {
  const { authorized } = await checkPageAccess(SSE_MONITOR_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<TableSkeleton />}>
      <SseMonitorPageContainer />
    </Suspense>
  );
}
