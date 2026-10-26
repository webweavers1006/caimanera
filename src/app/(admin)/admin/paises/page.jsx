import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { CountryPageContainer } from "@/features/countries/components/CountryPageContainer";
import { COUNTRY_CONFIG } from "@/features/countries";

const { LABELS } = COUNTRY_CONFIG.UI;

export const metadata = {
  title: `${COUNTRY_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function CountriesPage({ searchParams }) {
  const { authorized } = await checkPageAccess(COUNTRY_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><CountryPageContainer searchParams={searchParams} /></Suspense>;
}
