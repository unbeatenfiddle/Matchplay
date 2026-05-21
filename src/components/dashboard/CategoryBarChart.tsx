'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '@/context/DataContext';
import { computeCategoryBreakdown } from '@/lib/computeChartData';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

const COLORS = ['#2563EB','#16A34A','#DC2626','#D97706','#7C3AED','#0891B2','#DB2777','#65A30D','#EA580C','#0D9488','#9333EA','#CA8A04'];

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

export function CategoryBarChart() {
  const { filteredRows } = useData();
  const data = useMemo(() => computeCategoryBreakdown(filteredRows), [filteredRows]);

  return (
    <Card>
      <SectionHeader title="Revenue by Category" subtitle="Sorted by total revenue" />
      <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={fmtUSD}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={140}
            tick={{ fontSize: 11, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v, _n, item) => [`${fmtUSD(Number(v))} (${(item.payload as { pct: number }).pct.toFixed(1)}%)`, 'Revenue']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: unknown) => fmtUSD(Number(v)), fontSize: 11, fill: '#6B7280' }}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
