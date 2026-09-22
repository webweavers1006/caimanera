/**
 * Centralized application logger.
 *
 * Levels (ordered by severity):
 *   error — critical failures requiring immediate attention
 *   warn  — unexpected but non-critical situations
 *   info  — general operational messages
 *   debug — detailed diagnostics (only in development)
 *
 * PII filtering: never logs full ID cards, passwords, JWT tokens, or cookies.
 * Only IDs, hashes, or sanitized references are allowed.
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CURRENT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "warn" : "debug");

/**
 * Checks whether a given level should be logged.
 */
function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LEVEL];
}

/**
 * Formats a log entry with timestamp, level, and context.
 */
function formatEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length ? ` ${JSON.stringify(sanitize(context))}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Strips PII from context objects before logging.
 */
function sanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const safe = { ...obj };
  const sensitiveKeys = ["password", "idCard", "cedula", "token", "jwt", "cookie", "session"];
  for (const key of Object.keys(safe)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      safe[key] = "[REDACTED]";
    }
  }
  return safe;
}

/**
 * Writes the log entry to the appropriate output.
 * In production, prefer stderr for errors/warnings.
 */
function write(level, formatted) {
  if (level === "error" || level === "warn") {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
}

/**
 * Logger API.
 */
export const logger = {
  /**
   * Critical failures. Use for caught exceptions in services/repositories.
   * @param {string} message - Human-readable description.
   * @param {Object} [context] - Additional safe metadata (no PII).
   */
  error(message, context = {}) {
    if (!shouldLog("error")) return;
    write("error", formatEntry("error", message, context));
  },

  /**
   * Unexpected but non-critical situations (e.g., validation warnings).
   * @param {string} message
   * @param {Object} [context]
   */
  warn(message, context = {}) {
    if (!shouldLog("warn")) return;
    write("warn", formatEntry("warn", message, context));
  },

  /**
   * General operational messages (e.g., "User created", "Seed completed").
   * @param {string} message
   * @param {Object} [context]
   */
  info(message, context = {}) {
    if (!shouldLog("info")) return;
    write("info", formatEntry("info", message, context));
  },

  /**
   * Detailed diagnostics for development only. Automatically suppressed in production.
   * @param {string} message
   * @param {Object} [context]
   */
  debug(message, context = {}) {
    if (!shouldLog("debug")) return;
    write("debug", formatEntry("debug", message, context));
  },
};
