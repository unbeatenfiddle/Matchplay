'use client';

import { useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Trophy, TrendingDown, PieChart } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { computeKpis } from '@/lib/computeKpis';
import { KpiCard } from './KpiCard';

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function KpiRow() {
  const { filteredRows, state } = useData();
  const kpis = useMemo(() => computeKpis(filteredRows), [filteredRows]);
  const singleDay = state.filters.selectedDates.length === 1;

  return (
    <div className={`grid gap-4 grid-cols-2 ${singleDay ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-6'}`}>
      <KpiCard
        title="Total Revenue"
        value={fmtUSD(kpis.totalRevenue)}
        subtitle="All filtered days"
        icon={DollarSign}
        iconColor="text-blue-600"
      />
      <KpiCard
        title="Items Sold"
        value={kpis.totalItemsSold.toLocaleString()}
        subtitle="Total quantity"
        icon={ShoppingCart}
        iconColor="text-indigo-600"
      />
      {!singleDay && (
        <KpiCard
          title="Avg Daily Revenue"
          value={fmtUSD(kpis.avgDailyRevenue)}
          subtitle="Per operating day"
          icon={TrendingUp}
          iconColor="text-emerald-600"
        />
      )}
      {!singleDay && (
        <KpiCard
          title="Best Day"
          value={fmtUSD(kpis.bestDay.revenue)}
          subtitle={fmtDate(kpis.bestDay.date)}
          icon={Trophy}
          iconColor="text-amber-500"
        />
      )}
      {!singleDay && (
        <KpiCard
          title="Lowest Day"
          value={fmtUSD(kpis.worstDay.revenue)}
          subtitle={fmtDate(kpis.worstDay.date)}
          icon={TrendingDown}
          iconColor="text-rose-500"
        />
      )}
      <KpiCard
        title="Food / Beverage"
        value={`${kpis.foodPct.toFixed(0)}% / ${kpis.bevPct.toFixed(0)}%`}
        subtitle={`${fmtUSD(kpis.foodRevenue)} food · ${fmtUSD(kpis.bevRevenue)} bev`}
        icon={PieChart}
        iconColor="text-purple-600"
      />
    </div>
  );
}
