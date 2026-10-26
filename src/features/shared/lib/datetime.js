/**
 * Date/time helpers for Caimanera.
 *
 * Persistence is always UTC. Display values are formatted in the business
 * timezone with `date-fns-tz`, so the server (UTC) and the browser agree.
 */

import { differenceInCalendarDays } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

export const APP_TIME_ZONE = "America/Caracas";
export const APP_LOCALE = "es-VE";

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Converts a `datetime-local` value ("2026-10-25T18:30") interpreted in the
 * business timezone into a real UTC Date.
 *
 * @param {string|Date|null|undefined} value
 * @param {string} [timeZone]
 * @returns {Date|null}
 */
export function zonedLocalToDate(value, timeZone = APP_TIME_ZONE) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parsed = fromZonedTime(value, timeZone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Converts a `datetime-local` value to an ISO UTC string.
 * Non datetime-local values (already ISO) are returned untouched.
 */
export function zonedLocalToISO(value, timeZone = APP_TIME_ZONE) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value;
  }

  const date = zonedLocalToDate(value, timeZone);
  return date ? date.toISOString() : value;
}

/**
 * Formats a date with a date-fns pattern in the business timezone.
 */
export function formatZoned(value, pattern, timeZone = APP_TIME_ZONE) {
  const date = toDate(value);
  if (!date) return null;
  return formatInTimeZone(date, timeZone, pattern, { locale: es });
}

/**
 * Formats a date for display: "vie, 25 oct 2026".
 */
export function formatDateLong(value, timeZone = APP_TIME_ZONE) {
  return formatZoned(value, "EEE, d MMM yyyy", timeZone);
}

/**
 * Formats a date without year: "vie, 25 oct".
 */
export function formatDateShort(value, timeZone = APP_TIME_ZONE) {
  return formatZoned(value, "EEE, d MMM", timeZone);
}

/**
 * Formats a time: "6:30 p. m.".
 */
export function formatTime(value, timeZone = APP_TIME_ZONE) {
  return formatZoned(value, "h:mm aaaa", timeZone);
}

/**
 * Formats a full date-time label: "vie, 25 oct · 6:30 p. m.".
 */
export function formatDateTime(value, timeZone = APP_TIME_ZONE) {
  const date = formatDateShort(value, timeZone);
  const time = formatTime(value, timeZone);
  if (!date || !time) return null;
  return `${date} · ${time}`;
}

/**
 * Converts a date into the value expected by `<input type="datetime-local">`.
 */
export function toZonedInputValue(value, timeZone = APP_TIME_ZONE) {
  return formatZoned(value, "yyyy-MM-dd'T'HH:mm", timeZone) || "";
}

/**
 * Returns the calendar key (YYYY-MM-DD) of a date in the business timezone.
 */
export function zonedDateKey(value, timeZone = APP_TIME_ZONE) {
  return formatZoned(value, "yyyy-MM-dd", timeZone);
}

/**
 * Whole-day difference between a date and "now" in the business timezone.
 * 0 = today, 1 = tomorrow, negative = past.
 */
export function daysFromToday(value, timeZone = APP_TIME_ZONE) {
  const date = toDate(value);
  if (!date) return null;

  return differenceInCalendarDays(
    toZonedTime(date, timeZone),
    toZonedTime(new Date(), timeZone)
  );
}

/**
 * True when the supplied date is already in the past.
 */
export function isPastDate(value) {
  const date = toDate(value);
  if (!date) return false;
  return date.getTime() < Date.now();
}
