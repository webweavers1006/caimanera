/**
 * Date Formatting Utilities — Venezuela Timezone (America/Caracas, UTC-4)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Formatting functions: formatDate, formatTime, formatRelativeTime, etc.
 * Also exports shared constants (TIMEZONE, formatters) used by sibling modules.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TIMEZONE = 'America/Caracas'

// ── Formatters (cached for performance) ──────────────────────────────────

export const dateFormatter = new Intl.DateTimeFormat('es-VE', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const timeFormatter = new Intl.DateTimeFormat('es-VE', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export const dateTimeFormatter = new Intl.DateTimeFormat('es-VE', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

// ── Date Formatting (for UI display) ─────────────────────────────────────

/**
 * Formats a date for display in dd/MM/yyyy using Venezuela timezone.
 * Use for: table columns, detail views, list items — ANY user-facing date.
 *
 * @param {Date|string} input - Date object, ISO string, or YYYY-MM-DD string.
 * @param {string} [format='dd/MM/yyyy'] - Format preset: 'dd/MM/yyyy', 'dd/MM/yyyy HH:mm', or 'HH:mm'.
 * @returns {string} Formatted date string, or "—" if invalid.
 */
export function formatDate(input, format = 'dd/MM/yyyy') {
  if (!input) return '—'
  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) return '—'

  if (format === 'HH:mm') {
    const parts = timeFormatter.formatToParts(date)
    const h = parts.find(p => p.type === 'hour').value
    const m = parts.find(p => p.type === 'minute').value
    return `${h}:${m}`
  }

  if (format === 'dd/MM/yyyy HH:mm') {
    const parts = dateTimeFormatter.formatToParts(date)
    const day = parts.find(p => p.type === 'day').value
    const month = parts.find(p => p.type === 'month').value
    const year = parts.find(p => p.type === 'year').value
    const hour = parts.find(p => p.type === 'hour').value
    const minute = parts.find(p => p.type === 'minute').value
    return `${day}/${month}/${year} ${hour}:${minute}`
  }

  // Default dd/MM/yyyy: use UTC to preserve calendar date for @db.Date fields.
  // Timestamptz dates may differ by ≤1 day vs local time, but this is the
  // correct trade-off: @db.Date (caseDate, incidentDate, etc.) are pure dates
  // with no time component, and UTC midnight IS the intended calendar date.
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

/**
 * @deprecated Use formatDate(input, 'dd/MM/yyyy') instead.
 * Kept for backward compatibility during migration.
 */
export function formatDateUTC(input, fmt) {
  return formatDate(input, fmt)
}

/**
 * Formats ONLY the time portion of a Date for display (HH:mm).
 * @param {Date|string} input
 * @returns {string} e.g. "17:30" or "--:--" if invalid.
 */
export function formatTime(input) {
  return formatDate(input, 'HH:mm')
}

/**
 * @deprecated Use formatTime(input) instead.
 */
export function formatTimeUTC(input) {
  return formatTime(input)
}

// ── Utility ──────────────────────────────────────────────────────────────

/**
 * Formatea minutos a formato legible (ej: 90 → "1h 30m").
 * @param {number} mins
 * @returns {string}
 */
export function formatHM(mins) {
  const m = Number(mins) || 0
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

/**
 * Returns the current year in Venezuela timezone.
 * @returns {number} e.g. 2026
 */
export function currentYearVE() {
  const parts = dateFormatter.formatToParts(new Date())
  return parseInt(parts.find(p => p.type === 'year').value, 10)
}

/**
 * Formats a date as a human-readable relative time string.
 * Use for: notification timestamps, "last seen" indicators.
 *
 * @param {Date|string} dateStr - Date object or ISO string.
 * @param {Object} [opts] - Label overrides for i18n.
 * @param {string} [opts.justNow] - Label for < 1 minute ago.
 * @param {Function} [opts.minutes] - (n) => label for n minutes ago.
 * @param {Function} [opts.hours] - (n) => label for n hours ago.
 * @param {Function} [opts.days] - (n) => label for n days ago.
 * @returns {string} Relative time string (e.g. "Hace 5 min", "Hace 2h", "Hace 3 d").
 */
export function formatRelativeTime(dateStr, opts = {}) {
  if (!dateStr) return "";

  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";

  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const {
    justNow = "Ahora",
    minutes = (n) => `Hace ${n} min`,
    hours = (n) => `Hace ${n}h`,
    days = (n) => `Hace ${n}d`,
  } = opts;

  if (diffMin < 1) return justNow;
  if (diffMin < 60) return minutes(diffMin);
  if (diffHrs < 24) return hours(diffHrs);
  return days(diffDays);
}
