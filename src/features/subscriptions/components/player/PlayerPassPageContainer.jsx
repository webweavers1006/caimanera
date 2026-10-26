import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { logger } from "@/features/shared/lib/logger";
import { fetchPlayerPassData } from "../../services/player-subscription.read.service";
import { PlayerPassView } from "./PlayerPassView";

export async function PlayerPassPageContainer({ userId }) {
  let data;

  try {
    data = await fetchPlayerPassData(userId);
  } catch (error) {
    logger.error("Error loading player pass", { error: error.message, userId });
    return (
      <ErrorAlert
        title="No pudimos cargar tu pase"
        message="Intenta recargar la página en unos segundos."
      />
    );
  }

  return (
    <PlayerPassView
      active={data.active}
      activePasses={data.activePasses}
      history={data.history}
      plans={data.plans}
      pendingPurchases={data.pendingPurchases}
    />
  );
}
