/**
 * Shared display formatters.
 */

export function formatPrice(value, { currency = "USD", decimals = 2 } = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  try {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(decimals)}`;
  }
}

export function formatVes(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;

  try {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `Bs. ${amount.toFixed(2)}`;
  }
}

export function formatCompactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat("es-VE", { notation: "compact" }).format(number);
}
