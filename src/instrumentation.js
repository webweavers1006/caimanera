/**
 * Next.js instrumentation hook — runs once at startup (Node.js runtime only).
 *
 * Installs global error handlers and initializes the EventBus with PostgreSQL
 * LISTEN/NOTIFY bridge for cross-worker real-time events.
 *
 * The actual Node.js handlers live in ./instrumentation-node.js and are
 * dynamically imported so the Edge Runtime compiler never sees process.on
 * or process.exit and doesn't emit warnings.
 *
 * This is a DEFENSE-IN-DEPTH measure. Individual features should still
 * handle their own errors (try/catch, .catch(), transporter.on('error')).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  // Only install error handlers in the Node.js server runtime.
  // Edge Runtime and browser have no process.on — skip entirely.
  if (typeof process === "undefined" || process.env.NEXT_RUNTIME !== "nodejs") return;

  // Dynamic import keeps Node.js APIs out of the Edge compiler's sight.
  const { installErrorHandlers } = await import("./instrumentation-node.js");
  installErrorHandlers();

  // Initialize EventBus PostgreSQL LISTEN/NOTIFY bridge.
  // Only enabled when EVENTBUS_CLUSTER_ENABLED=true (multi-worker/PM2 cluster mode).
  // In single-worker fork mode, this is pure overhead — skip it to avoid
  // unnecessary pg_notify queries and a wasted PostgreSQL connection.
  try {
    if (process.env.EVENTBUS_CLUSTER_ENABLED === "true") {
      const { eventBus } = await import("@/features/shared/lib/event-bus");
      await eventBus.enableClusterBridge();
    }
  } catch (err) {
    // Don't crash the app — SSE still works locally without PG bridge
    const { logger } = await import("@/features/shared/lib/logger");
    logger.error("Failed to initialize EventBus bridge", { error: err.message });
  }
}
