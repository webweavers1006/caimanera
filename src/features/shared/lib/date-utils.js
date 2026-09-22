/**
 * Centralized Date/Time Utilities — Venezuela Timezone (America/Caracas, UTC-4)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH for ALL date/time handling across the project.
 * Every module MUST use these functions. NO inline new Date(), toISOString(),
 * getTimezoneOffset(), or manual formatting anywhere else.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Barrel file — re-exports from sibling modules:
 *   date-format.js  → formatting & display functions
 *   date-parse.js   → parsing functions (string → Date)
 *   date-now.js     → current date/time functions
 */

// ── Formatting ──────────────────────────────────────────────────────────
export {
  formatDate,
  formatDateUTC,
  formatTime,
  formatTimeUTC,
  formatHM,
  currentYearVE,
  formatRelativeTime,
} from './date-format'

// ── Parsing ─────────────────────────────────────────────────────────────
export {
  parseDateInput,
  parseDateInputEndOfDay,
  toDateInput,
  parseTime,
} from './date-parse'

// ── Current time ────────────────────────────────────────────────────────
export {
  todayVE,
  nowTimeVE,
  getNowDefaults,
  nowVE,
} from './date-now'
