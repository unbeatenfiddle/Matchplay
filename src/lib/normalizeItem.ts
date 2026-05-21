/**
 * Strips POS serving-format suffixes (BTG = By The Glass, GLS = Glass) from
 * item names so that the same wine entered inconsistently aggregates as one item.
 * e.g. "Honig SB BTG" and "Honig SB GLS" both become "Honig SB".
 */
export function normalizeItemName(raw: string): string {
  return raw
    .trim()
    .replace(/\s*[-–]\s*(BTG|GLS)\s*$/i, '')
    .replace(/\s+(BTG|GLS)\s*$/i, '')
    .trim();
}
