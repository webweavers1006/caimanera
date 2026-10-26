import { Suspense } from "react";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { TransactionPageContainer } from "@/features/transactions/components/TransactionPageContainer";
import { TRANSACTION_CONFIG } from "@/features/transactions/config/transaction.constants";

const { LABELS } = TRANSACTION_CONFIG.UI;

export const metadata = {
  title: `${TRANSACTION_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function PaymentsPage({ searchParams }) {
  const { authorized } = await checkPageAccess(TRANSACTION_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<TableSkeleton />}>
      <TransactionPageContainer searchParams={searchParams} />
    </Suspense>
  );
}
