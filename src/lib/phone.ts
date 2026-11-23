/**
 * Kenyan mobile numbers: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX or 2541XXXXXXXX,
 * with optional spaces or dashes.
 */
export function isValidKenyanPhone(value: string): boolean {
  const compact = value.replace(/[\s-]/g, "");
  return /^(?:\+?254|0)[17]\d{8}$/.test(compact);
}

/** Normalises a valid Kenyan number to 2547XXXXXXXX (what M-Pesa and WhatsApp use). */
export function normalizeKenyanPhone(value: string): string | null {
  if (!isValidKenyanPhone(value)) return null;
  const compact = value.replace(/[\s-]/g, "").replace(/^\+/, "");
  return compact.startsWith("254") ? compact : `254${compact.slice(1)}`;
}
