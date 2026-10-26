import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoveryPageContainer } from "@/features/discovery/components/DiscoveryPageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `${SITE_CONFIG.name} — Encuentra partidos cerca de ti`,
  description:
    "Elige tu ubicación y descubre partidos y canchas cerca de ti. Inscríbete en segundos y juega.",
};

function DiscoveryFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DiscoveryFallback />}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <DiscoveryPageContainer />
      </div>
    </Suspense>
  );
}
