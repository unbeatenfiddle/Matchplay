'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';

function getMissingDays(loadedDates: string[]): string[] {
  if (loadedDates.length === 0) return [];

  // Build yesterday's ISO string in local timezone to avoid UTC-vs-local mismatch
  const now = new Date();
  const localYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayISO = [
    localYesterday.getFullYear(),
    String(localYesterday.getMonth() + 1).padStart(2, '0'),
    String(localYesterday.getDate()).padStart(2, '0'),
  ].join('-');

  const loaded = new Set(loadedDates);
  const missing: string[] = [];

  // Walk from earliest loaded date to yesterday using UTC noon (avoids DST jumps)
  const cursor = new Date(loadedDates[0] + 'T12:00:00Z');
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (iso > yesterdayISO) break;
    if (!loaded.has(iso)) missing.push(iso);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return missing;
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export function MissingDaysBanner() {
  const { state, availableDates } = useData();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal when data changes (e.g., new upload fills a gap)
  const missingKey = availableDates.join(',');
  useEffect(() => { setDismissed(false); }, [missingKey]);

  if (state.loading || dismissed) return null;

  const missing = getMissingDays(availableDates);
  if (missing.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Missing data for {missing.length} day{missing.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            {missing.map(formatDate).join(' · ')}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600 text-lg leading-none flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
