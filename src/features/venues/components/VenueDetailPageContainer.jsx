import { notFound } from "next/navigation";
import { getSession } from "@/features/auth/lib/auth";
import { validateSessionUser } from "@/features/auth/services/auth.read.service";
import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchVenueDetail } from "../services/venue.read.service";
import { VenueDetailView } from "./VenueDetailView";

export async function VenueDetailPageContainer({ venueId }) {
  const jwtSession = await getSession();
  const session = jwtSession ? await validateSessionUser(jwtSession) : null;

  let venue;

  try {
    venue = await fetchVenueDetail(venueId, session?.id || null);
  } catch (error) {
    logger.error("Error loading venue detail page", {
      error: error.message,
      venueId,
    });
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorAlert
          title="No pudimos cargar la cancha"
          message="Intenta recargar la página o vuelve al listado."
        />
      </div>
    );
  }

  if (!venue) notFound();

  return <VenueDetailView venue={venue} />;
}
