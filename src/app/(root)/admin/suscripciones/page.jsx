import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { SubscriptionPageContainer } from "@/features/subscriptions/components/SubscriptionPageContainer";
import { SUBSCRIPTION_CONFIG } from "@/features/subscriptions";

const { LABELS } = SUBSCRIPTION_CONFIG.UI;

export const metadata = {
  title: `${SUBSCRIPTION_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function SubscriptionsPage({ searchParams }) {
  const { authorized } = await checkPageAccess(SUBSCRIPTION_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><SubscriptionPageContainer searchParams={searchParams} /></Suspense>;
}
