import { SalesRow, ChartRevenueTrendPoint, ChartCategoryPoint, ChartFoodBevPoint, ChartDayOverDayPoint } from '@/types';
import { categoryToDisplayGroup } from './categoryConfig';

function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function computeRevenueTrend(rows: SalesRow[]): ChartRevenueTrendPoint[] {
  const byDate = new Map<string, number>();
  for (const row of rows) {
    if (row.amount > 0) byDate.set(row.date, (byDate.get(row.date) ?? 0) + row.amount);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, label: fmtDate(date), revenue }));
}

export function computeCategoryBreakdown(rows: SalesRow[]): ChartCategoryPoint[] {
  const byCat = new Map<string, number>();
  for (const row of rows) {
    if (row.amount > 0) byCat.set(row.category, (byCat.get(row.category) ?? 0) + row.amount);
  }
  const total = Array.from(byCat.values()).reduce((s, v) => s + v, 0);
  return Array.from(byCat.entries())
    .map(([category, revenue]) => ({ category, revenue, pct: total > 0 ? (revenue / total) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeFoodBev(rows: SalesRow[]): ChartFoodBevPoint[] {
  let food = 0, bev = 0;
  for (const row of rows) {
    if (row.amount <= 0) continue;
    if (row.foodOrBev === 'food') food += row.amount;
    else if (row.foodOrBev === 'beverage') bev += row.amount;
  }
  const total = food + bev;
  return [
    { name: 'Food', value: food, pct: total > 0 ? (food / total) * 100 : 0 },
    { name: 'Beverage', value: bev, pct: total > 0 ? (bev / total) * 100 : 0 },
  ];
}

const DAY_OVER_DAY_GROUPS = ['Food', 'Beer', 'Wine', 'Spirits', 'NonAlcoholic', 'Modifiers', 'Other', 'Sides'] as const;
type DayGroup = typeof DAY_OVER_DAY_GROUPS[number];

export function computeDayOverDay(rows: SalesRow[]): ChartDayOverDayPoint[] {
  const byDate = new Map<string, Map<string, number>>();
  for (const row of rows) {
    if (row.amount <= 0) continue;
    if (!byDate.has(row.date)) byDate.set(row.date, new Map());
    const groups = byDate.get(row.date)!;
    const grp = categoryToDisplayGroup(row.category);
    groups.set(grp, (groups.get(grp) ?? 0) + row.amount);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groups]) => {
      const point: ChartDayOverDayPoint = {
        date,
        label: fmtDate(date),
        Food: 0, Beer: 0, Wine: 0, Spirits: 0, NonAlcoholic: 0, Modifiers: 0, Sides: 0, Other: 0,
      };
      for (const grp of DAY_OVER_DAY_GROUPS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (point as any)[grp] = groups.get(grp) ?? 0;
      }
      return point;
    });
}

export { DAY_OVER_DAY_GROUPS };
export type { DayGroup };
