'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '@/context/DataContext';
import { computeFoodBev } from '@/lib/computeChartData';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

const COLORS = ['#2563EB', '#16A34A'];

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

export function FoodBevDonut() {
  const { filteredRows } = useData();
  const data = useMemo(() => computeFoodBev(filteredRows), [filteredRows]);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <SectionHeader title="Food vs. Beverage" subtitle="Revenue split" />
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              dataKey="value"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, _n, item) => [`${fmtUSD(Number(v))} (${(item.payload as { pct: number }).pct.toFixed(1)}%)`, (item.payload as { name: string }).name]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
            />
            <Legend
              formatter={(value, entry) => (
                <span style={{ fontSize: 13, color: '#374151' }}>
                  {value}: {fmtUSD((entry.payload as { value: number }).value)} ({(entry.payload as { pct: number }).pct.toFixed(1)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center" style={{ marginTop: '-24px' }}>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-bold text-gray-900">{fmtUSD(total)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
