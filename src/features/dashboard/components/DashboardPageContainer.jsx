import { SHARED_CONFIG } from "@/features/shared";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { logger } from "@/features/shared";
import { DashboardView } from "./DashboardView";
import { fetchDashboardStats } from "../services/dashboard.read.service";
import { DASHBOARD_CONFIG } from "../config/dashboard.constants";

export async function DashboardPageContainer() {
  let stats;

  try {
    stats = await fetchDashboardStats();
  } catch (error) {
    logger.error("Error loading dashboard", { error: error.message });
    return (
      <ErrorAlert
        title={SHARED_CONFIG.UI.LABELS.MESSAGES.ERROR_TITLE}
        message={DASHBOARD_CONFIG.UI.LABELS.ERROR.LOAD}
      />
    );
  }

  return <DashboardView stats={stats} />;
}
