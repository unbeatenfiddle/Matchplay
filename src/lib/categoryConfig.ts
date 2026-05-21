function normalize(raw: string): string {
  return raw.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export type WineColor = 'red' | 'white' | 'sparkling' | 'rosé';

// Categories that are always a specific wine color (before item-level override)
const ALWAYS_RED_CATS = new Set(['btl cabernet sauvignon', 'btl pinot noir', 'btl other red']);
const ALWAYS_WHITE_CATS = new Set(['btl chardonnay', 'btl other white', 'gls white wine']);
const ALWAYS_SPARKLING_CATS = new Set(['btl sparkling wine']);
// 'gls wine' is mixed — must classify per item

function classifyGlsWineItem(item: string): WineColor {
  const n = item.toLowerCase();
  if (n.includes('ros') && (n.includes('é') || n.includes('rosé') || n.includes('rose'))) return 'rosé';
  if (n.includes('chandon') || n.includes('mumm') || n.includes('brut') || n.includes('schramsberg') || n.includes('mimosa')) return 'sparkling';
  if (n.includes(' pn') || n.includes('pinot') || n.includes('cab') || n.includes('merlot') ||
      n.includes('malbec') || n.includes('daou') || n.includes('faiveley') ||
      n.includes('belted') || n.includes('ken wright') || n.includes('bernardus') ||
      n.includes('goldeneye btg')) return 'red';
  if (n.includes('chardonnay') || n.includes(' sb') || n.includes('sauvignon') ||
      n.includes('honig') || n.includes('barnett') || n.includes('buchaine') ||
      n.includes('bouchaine') || n.includes('jayson') || n.includes('ink grade')) return 'white';
  return 'white';
}

/** Returns wine color for any wine category row, or null for non-wine rows. */
export function wineColor(rawCategory: string, itemName: string): WineColor | null {
  const n = normalize(rawCategory);
  const allWineCats = new Set([...ALWAYS_RED_CATS, ...ALWAYS_WHITE_CATS, ...ALWAYS_SPARKLING_CATS, 'gls wine']);
  if (!allWineCats.has(n)) return null;

  const itemLower = itemName.toLowerCase();
  // Item-level rosé override applies to all categories (e.g., "Daou Rose" in BTL Chardonnay)
  if (itemLower.includes('rose') || itemLower.includes('rosé')) return 'rosé';

  if (ALWAYS_RED_CATS.has(n)) return 'red';
  if (ALWAYS_WHITE_CATS.has(n)) return 'white';
  if (ALWAYS_SPARKLING_CATS.has(n)) return 'sparkling';
  return classifyGlsWineItem(itemName);
}

const FOOD_CATEGORIES = new Set([
  'appetizers', 'breakfast food', 'dessert', 'entree fish', 'entree kids',
  'entree meat', 'entree poultry', 'entree vegetarian', 'salad & soup',
  'sides', 'fire course', 'priced food mod', 'n/c food mods',
]);

const BEVERAGE_CATEGORIES = new Set([
  'beer bottle', 'beer draft', 'bourbon whiskey',
  'btl cabernet sauvignon', 'btl chardonnay', 'btl other red',
  'btl other white', 'btl pinot noir', 'btl sparkling wine',
  'cordial', 'gls white wine', 'gls wine', 'gin', 'liqueur',
  'liquor', 'liquor modifiers', 'liquor prep', 'mezcal',
  'non-alcoholic beverage', 'priced bev mods', 'priced liquor mods',
  'rum', 'scotch whiskey', 'tequila', 'vodka', 'blended spirits',
  'liqueurs',
]);

export function classifyCategory(raw: string): 'food' | 'beverage' | 'other' {
  const n = normalize(raw);
  if (FOOD_CATEGORIES.has(n)) return 'food';
  if (BEVERAGE_CATEGORIES.has(n)) return 'beverage';
  return 'other';
}

// Map raw categories to simplified display groups for Day-over-Day chart
export function categoryToDisplayGroup(raw: string): string {
  const n = normalize(raw);
  if (['appetizers', 'entree fish', 'entree kids', 'entree meat', 'entree poultry',
       'entree vegetarian', 'salad & soup', 'breakfast food', 'dessert'].includes(n)) return 'Food';
  if (n === 'sides') return 'Sides';
  if (['beer bottle', 'beer draft'].includes(n)) return 'Beer';
  if (['btl cabernet sauvignon', 'btl chardonnay', 'btl other red', 'btl other white',
       'btl pinot noir', 'btl sparkling wine', 'gls white wine', 'gls wine'].includes(n)) return 'Wine';
  if (['bourbon whiskey', 'gin', 'liqueur', 'liqueur', 'liqueurs', 'liquor', 'mezcal',
       'rum', 'scotch whiskey', 'tequila', 'vodka', 'blended spirits', 'cordial',
       'liquor prep'].includes(n)) return 'Spirits';
  if (n === 'non-alcoholic beverage') return 'NonAlcoholic';
  if (['priced food mod', 'priced liquor mods', 'priced bev mods', 'n/c food mods',
       'liquor modifiers', 'fire course'].includes(n)) return 'Modifiers';
  return 'Other';
}
