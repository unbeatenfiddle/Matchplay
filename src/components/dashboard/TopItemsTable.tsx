'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { AggregatedItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);
}

export function TopItemsTable() {
  const { filteredRows } = useData();
  const [sortBy, setSortBy] = useState<'revenue' | 'qty'>('revenue');
  const [limit, setLimit] = useState(15);

  const aggregated = useMemo<AggregatedItem[]>(() => {
    const map = new Map<string, AggregatedItem>();
    const totalRev = filteredRows.reduce((s, r) => s + r.amount, 0);
    for (const row of filteredRows) {
      const key = `${row.category}__${row.item}`;
      const existing = map.get(key);
      if (existing) {
        existing.totalQty += row.quantity;
        existing.totalRevenue += row.amount;
      } else {
        map.set(key, {
          category: row.category,
          item: row.item,
          totalQty: row.quantity,
          totalRevenue: row.amount,
          pctOfTotal: 0,
          foodOrBev: row.foodOrBev,
        });
      }
    }
    const items = Array.from(map.values());
    items.forEach(i => { i.pctOfTotal = totalRev > 0 ? (i.totalRevenue / totalRev) * 100 : 0; });
    return items;
  }, [filteredRows]);

  const sorted = useMemo(
    () => [...aggregated].sort((a, b) => sortBy === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalQty - a.totalQty),
    [aggregated, sortBy]
  );

  const rows = sorted.slice(0, limit);

  return (
    <Card>
      <SectionHeader
        title="Top Items"
        subtitle={`Showing top ${limit} of ${aggregated.length} items`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by</span>
            <button
              onClick={() => setSortBy(s => s === 'revenue' ? 'qty' : 'revenue')}
              className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'revenue' ? 'Revenue' : 'Quantity'}
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="text-left py-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
              <th className="text-left py-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-right py-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
              <th className="text-right py-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
              <th className="text-right py-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">% Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => (
              <tr key={`${item.category}-${item.item}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2 px-1 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2 px-1 font-medium text-gray-900">{item.item}</td>
                <td className="py-2 px-1 text-gray-500 text-xs">{item.category}</td>
                <td className="py-2 px-1 text-right text-gray-700">{item.totalQty.toLocaleString()}</td>
                <td className="py-2 px-1 text-right font-medium text-gray-900">{fmtUSD(item.totalRevenue)}</td>
                <td className="py-2 px-1 text-right text-gray-500">{item.pctOfTotal.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {aggregated.length > limit && (
        <button
          onClick={() => setLimit(l => l + 15)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Show more ({aggregated.length - limit} remaining)
        </button>
      )}
    </Card>
  );
}
