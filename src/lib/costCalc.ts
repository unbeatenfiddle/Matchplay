import { SalesRow, WineCostEntry, WineCostMap, WineCostKpis } from '@/types';
import { categoryToDisplayGroup } from './categoryConfig';
import { normalizeItemName } from './normalizeItem';

const ML_PER_OZ = 29.5735;
const BOTTLE_ML = 750;

export function isGlsCategory(rawCategory: string): boolean {
  const n = rawCategory.trim().toLowerCase();
  return n === 'gls wine' || n === 'gls white wine';
}

export function glsCostPerUnit(entry: WineCostEntry): number {
  if (entry.bottleCost <= 0 || entry.pourOz <= 0) return 0;
  return (entry.bottleCost / BOTTLE_ML) * (entry.pourOz * ML_PER_OZ);
}

export function btlCostPerUnit(entry: WineCostEntry): number {
  return entry.bottleCost > 0 ? entry.bottleCost : 0;
}

export function lookupRowCost(row: SalesRow, costMap: WineCostMap): number | null {
  if (categoryToDisplayGroup(row.category) !== 'Wine') return null;
  const key = normalizeItemName(row.item);
  const entry = costMap[key];
  if (!entry) return null;
  const unitCost = isGlsCategory(row.category) ? glsCostPerUnit(entry) : btlCostPerUnit(entry);
  return unitCost * row.quantity;
}

export function computeWineCostKpis(rows: SalesRow[], costMap: WineCostMap): WineCostKpis {
  let wineRevenue = 0;
  let wineCogs = 0;
  let coveredRevenue = 0;

  for (const row of rows) {
    if (categoryToDisplayGroup(row.category) !== 'Wine') continue;
    if (row.amount <= 0) continue;
    wineRevenue += row.amount;
    const cogs = lookupRowCost(row, costMap);
    if (cogs !== null) {
      wineCogs += cogs;
      coveredRevenue += row.amount;
    }
  }

  return {
    wineRevenue,
    wineCogs,
    wineCostPct: wineRevenue > 0 ? (wineCogs / wineRevenue) * 100 : NaN,
    coveredRevenuePct: wineRevenue > 0 ? (coveredRevenue / wineRevenue) * 100 : 0,
  };
}

export interface WineItemSummary {
  normalizedItem: string;
  hasGls: boolean;
  hasBtl: boolean;
  glsRevenue: number;
  btlRevenue: number;
}

export function extractWineItems(rows: SalesRow[]): WineItemSummary[] {
  const map = new Map<string, WineItemSummary>();

  for (const row of rows) {
    if (categoryToDisplayGroup(row.category) !== 'Wine') continue;
    const key = normalizeItemName(row.item);
    const existing = map.get(key) ?? {
      normalizedItem: key,
      hasGls: false,
      hasBtl: false,
      glsRevenue: 0,
      btlRevenue: 0,
    };
    if (isGlsCategory(row.category)) {
      existing.hasGls = true;
      existing.glsRevenue += row.amount > 0 ? row.amount : 0;
    } else {
      existing.hasBtl = true;
      existing.btlRevenue += row.amount > 0 ? row.amount : 0;
    }
    map.set(key, existing);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.normalizedItem.localeCompare(b.normalizedItem)
  );
}
