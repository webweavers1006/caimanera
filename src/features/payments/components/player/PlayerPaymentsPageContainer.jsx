import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { logger } from "@/features/shared/lib/logger";
import { fetchPlayerPayments } from "../../services/player-payments.read.service";
import { PlayerPaymentsView } from "./PlayerPaymentsView";

export async function PlayerPaymentsPageContainer({ userId }) {
  let payments;

  try {
    payments = await fetchPlayerPayments(userId);
  } catch (error) {
    logger.error("Error loading player payments", {
      error: error.message,
      userId,
    });
    return (
      <ErrorAlert
        title="No pudimos cargar tus pagos"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return <PlayerPaymentsView payments={payments} />;
}
