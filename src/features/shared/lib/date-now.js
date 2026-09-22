/**
 * Current Time Utilities — Venezuela Timezone (America/Caracas, UTC-4)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Functions that return the CURRENT date/time in Caracas TZ.
 * todayVE, nowTimeVE, getNowDefaults, nowVE.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { TIMEZONE, dateFormatter, timeFormatter } from './date-format'

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns the current date string in Venezuela timezone (YYYY-MM-DD).
 * Use for: form defaults, date comparisons, generating date-only strings.
 * @returns {string} e.g. "2026-06-23"
 */
export function todayVE() {
  const now = new Date()
  const parts = dateFormatter.formatToParts(now)
  const y = parts.find(p => p.type === 'year').value
  const m = parts.find(p => p.type === 'month').value
  const d = parts.find(p => p.type === 'day').value
  return `${y}-${m}-${d}`
}

/**
 * Returns the current time string in Venezuela timezone (HH:mm:ss).
 * Use for: audit time recording, time display.
 * @returns {string} e.g. "17:30:05"
 */
export function nowTimeVE() {
  const now = new Date()
  const parts = timeFormatter.formatToParts(now)
  const h = parts.find(p => p.type === 'hour').value
  const m = parts.find(p => p.type === 'minute').value
  const s = parts.find(p => p.type === 'second').value
  return `${h}:${m}:${s}`
}

/**
 * Returns the current date AND time as form-ready strings.
 * Use for: pre-filling date/time inputs.
 * @returns {{ date: string, time: string }} date as YYYY-MM-DD, time as HH:mm
 */
export function getNowDefaults() {
  const now = new Date()
  const dateParts = dateFormatter.formatToParts(now)
  const timeParts = timeFormatter.formatToParts(now)
  const y = dateParts.find(p => p.type === 'year').value
  const m = dateParts.find(p => p.type === 'month').value
  const d = dateParts.find(p => p.type === 'day').value
  const hh = timeParts.find(p => p.type === 'hour').value
  const mm = timeParts.find(p => p.type === 'minute').value
  return {
    date: `${y}-${m}-${d}`,
    time: `${hh}:${mm}`,
  }
}

/**
 * Returns the current Date object adjusted to Venezuela timezone.
 * Use for: creating audit entries, soft-delete timestamps.
 * @returns {Date}
 */
export function nowVE() {
  return new Date()
}
