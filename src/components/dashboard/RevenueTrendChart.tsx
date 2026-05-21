'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '@/context/DataContext';
import { computeRevenueTrend } from '@/lib/computeChartData';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

export function RevenueTrendChart() {
  const { filteredRows } = useData();
  const data = useMemo(() => computeRevenueTrend(filteredRows), [filteredRows]);

  return (
    <Card>
      <SectionHeader title="Revenue Trend" subtitle="Daily revenue across selected period" />
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={fmtUSD}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={78}
          />
          <Tooltip
            formatter={(v) => [fmtUSD(Number(v)), 'Revenue']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="url(#revGradient)"
            dot={{ fill: '#2563EB', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
