import { SalesRow, KpiData } from '@/types';

export function computeKpis(rows: SalesRow[]): KpiData {
  const byDate = new Map<string, number>();
  let totalRevenue = 0;
  let totalItemsSold = 0;
  let foodRevenue = 0;
  let bevRevenue = 0;

  for (const row of rows) {
    if (row.amount > 0) {
      totalRevenue += row.amount;
      byDate.set(row.date, (byDate.get(row.date) ?? 0) + row.amount);
      if (row.foodOrBev === 'food') foodRevenue += row.amount;
      else if (row.foodOrBev === 'beverage') bevRevenue += row.amount;
    }
    totalItemsSold += row.quantity;
  }

  const days = Array.from(byDate.entries());
  const avgDailyRevenue = days.length > 0 ? totalRevenue / days.length : 0;
  const bestEntry = days.reduce<[string, number] | null>((best, cur) => (!best || cur[1] > best[1] ? cur : best), null);
  const worstEntry = days.reduce<[string, number] | null>((worst, cur) => (!worst || cur[1] < worst[1] ? cur : worst), null);

  const foodPct = totalRevenue > 0 ? (foodRevenue / totalRevenue) * 100 : 0;
  const bevPct = totalRevenue > 0 ? (bevRevenue / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalItemsSold,
    avgDailyRevenue,
    bestDay: bestEntry ? { date: bestEntry[0], revenue: bestEntry[1] } : { date: '', revenue: 0 },
    worstDay: worstEntry ? { date: worstEntry[0], revenue: worstEntry[1] } : { date: '', revenue: 0 },
    foodRevenue,
    bevRevenue,
    foodPct,
    bevPct,
  };
}
