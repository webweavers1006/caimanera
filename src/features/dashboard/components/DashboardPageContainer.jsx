import { SHARED_CONFIG } from "@/features/shared";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { logger } from "@/features/shared";
import { DashboardView } from "./DashboardView";
import { fetchDashboardStats } from "../services/dashboard.read.service";
import { DASHBOARD_CONFIG } from "../config/dashboard.constants";

export async function DashboardPageContainer() {
  try {
    const stats = await fetchDashboardStats();
    return <DashboardView stats={stats} />;
  } catch (error) {
    logger.error("Error loading dashboard", { error: error.message });
    return (
      <ErrorAlert
        title={SHARED_CONFIG.UI.LABELS.MESSAGES.ERROR_TITLE}
        message={DASHBOARD_CONFIG.UI.LABELS.ERROR.LOAD}
      />
    );
  }
}
