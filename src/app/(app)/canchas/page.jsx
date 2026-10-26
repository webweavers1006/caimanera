import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VenuesPageContainer } from "@/features/venues/components/VenuesPageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `Canchas y clubes | ${SITE_CONFIG.name}`,
  description:
    "Descubre canchas y clubes cerca de ti, con sus próximos partidos disponibles.",
};

export default function VenuesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[16/10] w-full rounded-3xl" />
            ))}
          </div>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <VenuesPageContainer />
      </div>
    </Suspense>
  );
}
