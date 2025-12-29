export function toPeriod(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parsePeriod(period) {
  const [y, m] = period.split("-").map((x) => Number(x));
  return { year: y, month: m }; // month 1-12
}

export function makeDueDate({ year, month, dueDay }) {
  // month: 1-12
  return new Date(year, month - 1, dueDay, 12, 0, 0); // noon avoids TZ edge weirdness
}

export function isPast(date, now = new Date()) {
  return date.getTime() < now.getTime();
}

export function computeInvoiceStatus({ dueDate, amount, paidAmount }, now = new Date()) {
  const paid = Number(paidAmount || 0);
  const total = Number(amount || 0);

  if (paid >= total && total > 0) return "paid";
  if (paid > 0 && paid < total) return isPast(dueDate, now) ? "overdue" : "partial";
  return isPast(dueDate, now) ? "overdue" : "due";
}
