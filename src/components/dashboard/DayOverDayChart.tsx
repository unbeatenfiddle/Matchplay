'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '@/context/DataContext';
import { computeDayOverDay, DAY_OVER_DAY_GROUPS } from '@/lib/computeChartData';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

const GROUP_COLORS: Record<string, string> = {
  Food: '#2563EB',
  Beer: '#D97706',
  Wine: '#7C3AED',
  Spirits: '#DC2626',
  NonAlcoholic: '#0891B2',
  Modifiers: '#6B7280',
  Sides: '#16A34A',
  Other: '#9CA3AF',
};

const GROUP_LABELS: Record<string, string> = {
  NonAlcoholic: 'Non-Alc',
};

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

export function DayOverDayChart() {
  const { filteredRows } = useData();
  const data = useMemo(() => computeDayOverDay(filteredRows), [filteredRows]);

  return (
    <Card>
      <SectionHeader title="Day-over-Day Breakdown" subtitle="Revenue by category group per day" />
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
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
            formatter={(v, name) => [fmtUSD(Number(v)), GROUP_LABELS[String(name)] ?? String(name)]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
          />
          <Legend
            formatter={(v: string) => <span style={{ fontSize: 12 }}>{GROUP_LABELS[v] ?? v}</span>}
          />
          {DAY_OVER_DAY_GROUPS.map((grp) => (
            <Bar key={grp} dataKey={grp} stackId="a" fill={GROUP_COLORS[grp] ?? '#9CA3AF'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
