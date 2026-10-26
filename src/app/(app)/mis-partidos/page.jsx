import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MyMatchesPageContainer } from "@/features/player/components/MyMatchesPageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `Mis partidos | ${SITE_CONFIG.name}`,
  description: "Consulta los próximos partidos en los que estás inscrito.",
  robots: { index: false, follow: false },
};

function MyMatchesFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-2/3 rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
    </div>
  );
}

export default function MyMatchesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <Suspense fallback={<MyMatchesFallback />}>
        <MyMatchesPageContainer />
      </Suspense>
    </div>
  );
}
