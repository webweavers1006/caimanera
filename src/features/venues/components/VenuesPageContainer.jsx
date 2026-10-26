import { logger } from "@/features/shared/lib/logger";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { fetchVenueList } from "../services/venue.read.service";
import { VenuesView } from "./VenuesView";

/**
 * Public venue listing. It never touches the administrative court module.
 */
export async function VenuesPageContainer() {
  let venues;

  try {
    venues = await fetchVenueList();
  } catch (error) {
    logger.error("Error loading venues page", { error: error.message });
    return (
      <ErrorAlert
        title="No pudimos cargar las canchas"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return <VenuesView venues={venues} />;
}
