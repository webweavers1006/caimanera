import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchSearchPageContainer } from "@/features/match-search/components/MatchSearchPageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `Partidos cerca de ti | ${SITE_CONFIG.name}`,
  description:
    "Explora partidos y canchas disponibles cerca de tu ubicación. Filtra por deporte, día y distancia.",
};

export default async function PublicMatchesPage({ searchParams }) {
  const params = await searchParams;
  const legacyMatchId = params?.partido;

  // Canonical detail: old `?partido=` links move to `/partidos/[id]`.
  if (legacyMatchId) redirect(`/partidos/${encodeURIComponent(legacyMatchId)}`);

  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <MatchSearchPageContainer />
      </div>
    </Suspense>
  );
}
