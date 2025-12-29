export default function money(n) {
  const val = Number(n || 0);
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
  }).format(val);
}