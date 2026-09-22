import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { logger } from "@/features/shared";
import { fetchConnectionStats } from "@/features/sse-monitor/services/sse-monitor.read.service";
import { ConnectionStatsTable } from "@/features/sse-monitor/components/ConnectionStatsTable";
import { SSE_MONITOR_CONFIG } from "@/features/sse-monitor/config/sse-monitor.constants";

const { UI } = SSE_MONITOR_CONFIG;
const { LABELS } = UI;

/**
 * SseMonitorPageContainer — Server Component.
 *
 * Fetches initial SSE connection stats server-side and passes them
 * to the ConnectionStatsTable client component for real-time SSE updates.
 */
export async function SseMonitorPageContainer() {
  try {
    const initialStats = await fetchConnectionStats();

    return <ConnectionStatsTable initialStats={initialStats} />;
  } catch (error) {
    logger.error("Failed to load SSE connection stats", { error: error.message });
    return <ErrorAlert message={LABELS.ERROR} />;
  }
}
