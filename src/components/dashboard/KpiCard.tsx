import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
}

export function KpiCard({ title, value, subtitle, icon: Icon, iconColor = 'text-blue-600', trend }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 leading-none">{value}</p>
          {subtitle && <p className="mt-1.5 text-xs text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <span className={`inline-flex items-center mt-1.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs prior
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-lg bg-gray-50 ${iconColor} flex-shrink-0 ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
