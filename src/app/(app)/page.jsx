import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HomePageContainer } from "@/features/home/components/HomePageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `${SITE_CONFIG.name} — Encuentra tu próximo partido`,
  description:
    "Descubre canchas y partidos cerca de ti. Inicia sesión para inscribirte, comprar tu pase y ver tus pagos.",
};

function HomeFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-36 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <HomePageContainer />
      </div>
    </Suspense>
  );
}
