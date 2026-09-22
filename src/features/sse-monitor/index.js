/**
 * SSE Monitor — public API barrel.
 *
 * Only exports config & constants (no server-only functions).
 * Server-only imports (actions, services, tracker) must use deep imports.
 */

export { SSE_MONITOR_CONFIG } from "./config/sse-monitor.constants";
