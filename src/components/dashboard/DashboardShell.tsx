'use client';

import { useData } from '@/context/DataContext';
import { KpiRow } from './KpiRow';
import { FilterBar } from './FilterBar';
import { RevenueTrendChart } from './RevenueTrendChart';
import { CategoryBarChart } from './CategoryBarChart';
import { FoodBevDonut } from './FoodBevDonut';
import { DayOverDayChart } from './DayOverDayChart';
import { TopItemsTable } from './TopItemsTable';
import { BestSellersSection } from './BestSellersSection';
import { FullItemsTable } from './FullItemsTable';
import { UploadZone } from './UploadZone';
import { MissingDaysBanner } from './MissingDaysBanner';

function Skeleton({ h = 'h-40' }: { h?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${h}`} />;
}

export function DashboardShell() {
  const { state } = useData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">MatchPlay F&amp;B Analytics</h1>
            <p className="text-xs text-gray-500 mt-0.5">Silverado Resort · Executive Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{state.files.length} day{state.files.length !== 1 ? 's' : ''} loaded</p>
            {state.files.length > 0 && (
              <p className="text-xs text-gray-400">
                {new Date(state.files[0].date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                {' – '}
                {new Date(state.files[state.files.length - 1].date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        <MissingDaysBanner />

        {/* Filters */}
        {state.loading ? <Skeleton h="h-24" /> : <FilterBar />}

        {/* KPIs */}
        {state.loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} h="h-28" />)}
          </div>
        ) : (
          <KpiRow />
        )}

        {/* Revenue Trend + Food/Bev split */}
        {state.loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Skeleton h="h-72" /></div>
            <Skeleton h="h-72" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><RevenueTrendChart /></div>
            <FoodBevDonut />
          </div>
        )}

        {/* Day-over-Day */}
        {state.loading ? <Skeleton h="h-80" /> : <DayOverDayChart />}

        {/* Best Sellers by category */}
        {state.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} h="h-80" />)}
          </div>
        ) : (
          <BestSellersSection />
        )}

        {/* Category breakdown */}
        {state.loading ? <Skeleton h="h-96" /> : <CategoryBarChart />}

        {/* Top Items + Upload Zone */}
        {state.loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2"><Skeleton h="h-96" /></div>
            <Skeleton h="h-96" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2"><TopItemsTable /></div>
            <UploadZone />
          </div>
        )}

        {/* Full Items Table */}
        {state.loading ? <Skeleton h="h-96" /> : <FullItemsTable />}
      </main>
    </div>
  );
}
