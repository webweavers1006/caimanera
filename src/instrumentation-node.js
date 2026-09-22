import { logger } from "@/features/shared/lib/logger";

/**
 * Installs global Node.js error handlers for crash protection and
 * graceful shutdown (Prisma/PG pool cleanup + EventBus bridge).
 *
 * Called ONLY from instrumentation.js when NEXT_RUNTIME === "nodejs".
 * This file is dynamically imported so the Edge Runtime compiler never
 * sees process.on / process.exit and doesn't emit warnings.
 *
 * DEFENSE-IN-DEPTH: Individual features should still handle their own
 * errors (try/catch, .catch(), transporter.on('error')).
 */
export function installErrorHandlers() {
  // ── Uncaught exceptions → log + controlled exit ──
  process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION — process will exit", {
      error: err.message?.slice(0, 1000),
      stack: err.stack?.slice(0, 2000),
      code: err.code,
    });
    // Controlled exit so PM2/process manager can restart cleanly
    process.exit(1);
  });

  // ── Unhandled rejections → log without crashing ──
  process.on("unhandledRejection", (reason) => {
    logger.error("UNHANDLED REJECTION", {
      error: reason?.message?.slice(0, 1000) || String(reason).slice(0, 1000),
      stack: reason?.stack?.slice(0, 2000),
    });
    // Do NOT exit — let the event loop continue.
    // Unhandled rejections are deprecated-crash behavior in Node.js 15+,
    // but we log them explicitly to catch async bugs.
  });

  // ── Graceful shutdown (PM2 restart, deploy, docker stop) ──
  // Closes Prisma pool + EventBus listener cleanly to prevent
  // orphaned DB connections and connection pool exhaustion.
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal} — starting graceful shutdown`);

    // Give in-flight requests 5 seconds to finish before force-closing
    const forceExitTimer = setTimeout(() => {
      logger.warn("Graceful shutdown timed out — forcing exit");
      process.exit(0);
    }, 5000);
    forceExitTimer.unref();

    try {
      // Dynamic import so Edge compiler never sees this
      const prisma = (await import("@/features/shared/lib/prisma")).default;
      await prisma.$disconnect();
      logger.info("Prisma disconnected — pool closed");
    } catch (err) {
      logger.error("Error during Prisma disconnect", { error: err.message });
    }

    try {
      const { eventBus } = await import("@/features/shared/lib/event-bus");
      await eventBus.shutdown();
    } catch (err) {
      logger.error("Error during EventBus shutdown", { error: err.message });
    }

    clearTimeout(forceExitTimer);
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
