import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { AUTH_CONFIG } from "@/features/auth";
import { LoginLocksPageContainer } from "@/features/auth/components/LoginLocksPageContainer";

// Rate limiter data lives in server memory — never cache this page.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `${AUTH_CONFIG.LOGIN_LOCKS.TITLE} | Caimanera`,
  description: AUTH_CONFIG.LOGIN_LOCKS.DESCRIPTION,
};

export default async function LoginLocksPage() {
  const { authorized } = await checkPageAccess(AUTH_CONFIG.PERMISSIONS.LOGIN_UNLOCK);

  if (!authorized) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<TableSkeleton />}>
      <LoginLocksPageContainer />
    </Suspense>
  );
}
