/**
 * Date Parsing Utilities — Venezuela Timezone (America/Caracas, UTC-4)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Parsing functions for converting strings to Date objects in Caracas TZ.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { TIMEZONE, dateFormatter } from './date-format'

// ── Date Parsing (for @db.Date columns) ──────────────────────────────────

/**
 * Parses a date string (YYYY-MM-DD) into a Date object at Caracas midnight.
 * Use for: converting form date strings to Prisma @db.Date values.
 *
 * IMPORTANT: Do NOT use bare new Date("YYYY-MM-DD") — its behavior depends
 * on the server TZ. This function always produces the correct Venezuela date.
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format.
 * @returns {Date|null} Date object at Caracas midnight, or null if invalid.
 */
export function parseDateInput(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  // Create at 00:00 Caracas time (04:00 UTC)
  const [_, y, m, d] = match
  return new Date(`${y}-${m}-${d}T00:00:00-04:00`)
}

/**
 * Converts a Date to a YYYY-MM-DD string preserving the calendar date.
 * Uses UTC extraction because @db.Date fields from Prisma come as UTC midnight
 * and must round-trip correctly: 2026-07-27 → parseDateInput → DB → toDateInput → 2026-07-27.
 *
 * @param {Date|string} input - Date object or ISO string from @db.Date.
 * @returns {string} e.g. "2026-07-27" or empty string if invalid.
 */
export function toDateInput(input) {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) return ''
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parses a date string (YYYY-MM-DD) into a Date object at Caracas end-of-day
 * (23:59:59.999). Use for the UPPER bound (lte) of inclusive date-range
 * filters over @db.Timestamptz columns, so records from that day are included.
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format.
 * @returns {Date|null} Date object at Caracas end-of-day, or null if invalid.
 */
export function parseDateInputEndOfDay(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const [_, y, m, d] = match
  return new Date(`${y}-${m}-${d}T23:59:59.999-04:00`)
}

// ── Time Parsing ─────────────────────────────────────────────────────────

/**
 * Convierte un string de hora en formato "HH:mm" a un objeto Date.
 * @param {string} timeStr - Hora en formato "HH:mm"
 * @returns {Date|null} Objeto Date con la hora establecida o null si no es válido.
 */
export function parseTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0)
  return d
}
