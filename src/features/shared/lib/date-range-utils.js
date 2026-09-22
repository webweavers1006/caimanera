export function toDateOnly(input) {
  if (!input) return null;
  const d = typeof input === 'string' ? new Date(input) : new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = toDateOnly(a);
  const db = toDateOnly(b);
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth() === db.getMonth() &&
         da.getDate() === db.getDate();
}

export function buildDateWhereSingle(date) {
  const d = toDateOnly(date);
  return d ? d : undefined;
}

export function buildDateWhereRange(from, to) {
  const f = toDateOnly(from);
  const t = toDateOnly(to);
  return { gte: f, lte: t };
}
