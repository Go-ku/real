// lib/formatters.js

export function formatAddress(address) {
  if (!address) return "No address provided";
  
  // We can pull out the specific fields we want
  const { area, town, city } = address;
  
  // Logic to combine them...
  return [area, town, city].filter(Boolean).join(", ");
}