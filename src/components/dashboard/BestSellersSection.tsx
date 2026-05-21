'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '@/context/DataContext';
import { categoryToDisplayGroup, wineColor, WineColor } from '@/lib/categoryConfig';
import { normalizeItemName } from '@/lib/normalizeItem';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface ItemRow {
  item: string;
  totalQty: number;
  totalRevenue: number;
}

interface PanelConfig {
  title: string;
  color: string;
}

const TOP_N = 10;

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);
}

function RankedList({ rows, sortBy, color }: { rows: ItemRow[]; sortBy: 'revenue' | 'qty'; color: string }) {
  const sorted = [...rows]
    .sort((a, b) => sortBy === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalQty - a.totalQty)
    .slice(0, TOP_N);
  const maxVal = sorted.length > 0 ? (sortBy === 'revenue' ? sorted[0].totalRevenue : sorted[0].totalQty) : 1;

  if (sorted.length === 0) {
    return <p className="text-xs text-gray-400 py-4 text-center">No data</p>;
  }

  return (
    <ol className="space-y-2">
      {sorted.map((item, i) => {
        const val = sortBy === 'revenue' ? item.totalRevenue : item.totalQty;
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <li key={item.item} className="flex items-center gap-1.5">
            <span className="text-xs font-bold w-4 text-right shrink-0" style={{ color: i < 3 ? color : '#9CA3AF' }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-medium text-gray-800 truncate leading-tight">{item.item}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-1">
                  {sortBy === 'revenue' ? fmtUSD(item.totalRevenue) : item.totalQty.toLocaleString()}
                </span>
              </div>
              <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color, opacity: Math.max(0.35, 0.85 - i * 0.05) }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function BestSellerPanel({ title, color, rows, subtitle }: PanelConfig & { rows: ItemRow[]; subtitle?: string }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle ?? `${rows.length} items`} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 mt-1">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Revenue</p>
          <RankedList rows={rows} sortBy="revenue" color={color} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quantity</p>
          <RankedList rows={rows} sortBy="qty" color={color} />
        </div>
      </div>
    </Card>
  );
}

const WINE_COLORS: Record<string, string> = {
  Red: '#B91C1C',
  White: '#CA8A04',
  Sparkling: '#0891B2',
  Rosé: '#DB2777',
};

function WineComparisonCard({ byColor }: { byColor: Record<string, ItemRow[]> }) {
  const data = useMemo(() => {
    return Object.entries(byColor)
      .map(([label, items]) => ({
        name: label,
        revenue: items.reduce((s, i) => s + i.totalRevenue, 0),
        qty: items.reduce((s, i) => s + i.totalQty, 0),
      }))
      .filter(d => d.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [byColor]);

  const totalRev = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <Card>
      <SectionHeader title="Red vs. White" subtitle="Wine revenue breakdown" />
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No data for selected filters</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={36}>
                {data.map(entry => (
                  <Cell key={entry.name} fill={WINE_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: unknown) => [fmtUSD(Number(v)), 'Revenue']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {data.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: WINE_COLORS[d.name] ?? '#94A3B8' }} />
                  <span className="text-gray-700">{d.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{fmtUSD(d.revenue)}</span>
                  <span className="text-gray-400 ml-1.5 text-xs">
                    ({totalRev > 0 ? ((d.revenue / totalRev) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export function BestSellersSection() {
  const { filteredRows } = useData();

  const { food, spirits, beer, wineByColor } = useMemo(() => {
    const foodMap = new Map<string, ItemRow>();
    const spiritsMap = new Map<string, ItemRow>();
    const beerMap = new Map<string, ItemRow>();
    const wineColorMaps: Record<WineColor, Map<string, ItemRow>> = {
      red: new Map(), white: new Map(), sparkling: new Map(), rosé: new Map(),
    };

    function upsert(map: Map<string, ItemRow>, item: string, qty: number, amount: number) {
      const key = normalizeItemName(item);
      const existing = map.get(key);
      if (existing) { existing.totalQty += qty; existing.totalRevenue += amount; }
      else map.set(key, { item: key, totalQty: qty, totalRevenue: amount });
    }

    for (const row of filteredRows) {
      const group = categoryToDisplayGroup(row.category);
      if (group === 'Food') upsert(foodMap, row.item, row.quantity, row.amount);
      else if (group === 'Spirits') upsert(spiritsMap, row.item, row.quantity, row.amount);
      else if (group === 'Beer') upsert(beerMap, row.item, row.quantity, row.amount);
      else if (group === 'Wine') {
        const color = wineColor(row.category, row.item) ?? 'white';
        upsert(wineColorMaps[color], row.item, row.quantity, row.amount);
      }
    }

    return {
      food: Array.from(foodMap.values()),
      spirits: Array.from(spiritsMap.values()),
      beer: Array.from(beerMap.values()),
      wineByColor: {
        Red: Array.from(wineColorMaps.red.values()),
        White: Array.from(wineColorMaps.white.values()),
        Sparkling: Array.from(wineColorMaps.sparkling.values()),
        Rosé: Array.from(wineColorMaps.rosé.values()),
      },
    };
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {/* Row 1: Food / Cocktails / Beer */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Best Sellers by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <BestSellerPanel title="Top Food" color="#16A34A" rows={food} subtitle={`${food.length} items`} />
          <BestSellerPanel title="Top Cocktails" color="#7C3AED" rows={spirits} subtitle={`${spirits.length} items`} />
          <BestSellerPanel title="Top Beer" color="#D97706" rows={beer} subtitle={`${beer.length} items`} />
        </div>
      </div>

      {/* Row 2: Wine split */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">Wine</h2>
        <p className="text-xs text-gray-500 mb-4">Glass and bottle combined · ranked by revenue and quantity</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <BestSellerPanel title="Red Wine" color={WINE_COLORS.Red} rows={wineByColor.Red} subtitle={`${wineByColor.Red.length} items`} />
          <BestSellerPanel title="White Wine" color={WINE_COLORS.White} rows={wineByColor.White} subtitle={`${wineByColor.White.length} items`} />
          <BestSellerPanel title="Sparkling" color={WINE_COLORS.Sparkling} rows={wineByColor.Sparkling} subtitle={`${wineByColor.Sparkling.length} items`} />
          <WineComparisonCard byColor={wineByColor} />
        </div>
      </div>
    </div>
  );
}
