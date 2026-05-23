'use client';

import { useMemo } from 'react';
import { Wine, TrendingDown, BarChart2, CheckCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { computeWineCostKpis } from '@/lib/costCalc';
import { KpiCard } from './KpiCard';

function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function WineKpiRow() {
  const { filteredRows, state } = useData();
  const kpis = useMemo(() => computeWineCostKpis(filteredRows, state.wineCosts), [filteredRows, state.wineCosts]);

  if (kpis.wineRevenue === 0 || Object.keys(state.wineCosts).length === 0) return null;

  const costPctColor = isNaN(kpis.wineCostPct)
    ? 'text-gray-400'
    : kpis.wineCostPct > 35 ? 'text-rose-500' : 'text-emerald-600';

  const coverageColor = kpis.coveredRevenuePct >= 80 ? 'text-emerald-600' : 'text-amber-500';

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Wine Revenue"
        value={fmtUSD(kpis.wineRevenue)}
        subtitle="Filtered period"
        icon={Wine}
        iconColor="text-purple-600"
      />
      <KpiCard
        title="Wine COGS"
        value={kpis.wineCogs > 0 ? fmtUSD(kpis.wineCogs) : '—'}
        subtitle="Cost of goods sold"
        icon={TrendingDown}
        iconColor="text-rose-500"
      />
      <KpiCard
        title="Wine Cost %"
        value={isNaN(kpis.wineCostPct) ? '—' : `${kpis.wineCostPct.toFixed(1)}%`}
        subtitle="COGS ÷ wine revenue"
        icon={BarChart2}
        iconColor={costPctColor}
      />
      <KpiCard
        title="Cost Coverage"
        value={`${kpis.coveredRevenuePct.toFixed(0)}%`}
        subtitle="Revenue with costs entered"
        icon={CheckCircle}
        iconColor={coverageColor}
      />
    </div>
  );
}
