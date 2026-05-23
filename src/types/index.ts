export interface SalesRow {
  date: string;
  category: string;
  item: string;
  quantity: number;
  amount: number;
  foodOrBev: 'food' | 'beverage' | 'other';
}

export interface DailyFile {
  date: string;
  filename: string;
  source: 'preloaded' | 'uploaded';
  rows: SalesRow[];
  totalRevenue: number;
  totalQty: number;
}

export interface AppFilters {
  selectedDates: string[];
  selectedCategories: string[];
}

export interface KpiData {
  totalRevenue: number;
  totalItemsSold: number;
  avgDailyRevenue: number;
  bestDay: { date: string; revenue: number };
  worstDay: { date: string; revenue: number };
  foodRevenue: number;
  bevRevenue: number;
  foodPct: number;
  bevPct: number;
}

export interface ChartRevenueTrendPoint {
  date: string;
  label: string;
  revenue: number;
}

export interface ChartCategoryPoint {
  category: string;
  revenue: number;
  pct: number;
}

export interface ChartFoodBevPoint {
  name: string;
  value: number;
  pct: number;
}

export interface ChartDayOverDayPoint {
  date: string;
  label: string;
  Food: number;
  Beer: number;
  Wine: number;
  Spirits: number;
  NonAlcoholic: number;
  Modifiers: number;
  Sides: number;
  Other: number;
}

export interface AggregatedItem {
  category: string;
  item: string;
  totalQty: number;
  totalRevenue: number;
  pctOfTotal: number;
  foodOrBev: 'food' | 'beverage' | 'other';
}

export interface WineCostEntry {
  normalizedItem: string;
  bottleCost: number;
  pourOz: number;
}

export type WineCostMap = Record<string, WineCostEntry>;

export interface WineCostKpis {
  wineRevenue: number;
  wineCogs: number;
  wineCostPct: number;
  coveredRevenuePct: number;
}
