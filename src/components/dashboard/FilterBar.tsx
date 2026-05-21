'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/context/DataContext';

function fmtDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  Food: ['Appetizers', 'Breakfast Food', 'Dessert', 'Entree Fish', 'Entree Kids', 'Entree Meat', 'Entree Poultry', 'Entree Vegetarian', 'Salad & Soup', 'Fire Course'],
  Sides: ['Sides'],
  Beer: ['Beer Bottle', 'Beer Draft'],
  Wine: ['BTL Cabernet Sauvignon', 'BTL Chardonnay', 'BTL Other Red', 'BTL Other White', 'BTL Pinot Noir', 'BTL Sparkling Wine', 'GLS White Wine', 'GLS Wine'],
  Spirits: ['Blended Spirits', 'Bourbon Whiskey', 'Cordial', 'Gin', 'Liqueur', 'Liqueurs', 'Liquor', 'Mezcal', 'Rum', 'Scotch Whiskey', 'Tequila', 'Vodka'],
  'Non-Alc': ['Non-Alcoholic Beverage'],
  Modifiers: ['Liquor Modifiers', 'Liquor Prep', 'N/C Food Mods', 'Priced Bev Mods', 'Priced Food Mod', 'Priced Liquor Mods'],
};

export function FilterBar() {
  const { availableDates, availableCategories, state, dispatch } = useData();
  const { selectedDates, selectedCategories } = state.filters;
  const hasFilters = selectedDates.length > 0 || selectedCategories.length > 0;

  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Reset inputs when filters are cleared externally
  useEffect(() => {
    if (selectedDates.length === 0) {
      setRangeStart('');
      setRangeEnd('');
    }
  }, [selectedDates.length]);

  const minDate = availableDates[0] ?? '';
  const maxDate = availableDates[availableDates.length - 1] ?? '';

  function applyRange(start: string, end: string) {
    const dates = availableDates.filter(d => d >= start && d <= end);
    dispatch({ type: 'SET_DATE_FILTER', dates });
  }

  function handleStartChange(val: string) {
    setRangeStart(val);
    if (val && rangeEnd) applyRange(val, rangeEnd);
    else if (val && !rangeEnd) applyRange(val, maxDate);
  }

  function handleEndChange(val: string) {
    setRangeEnd(val);
    if (rangeStart && val) applyRange(rangeStart, val);
    else if (!rangeStart && val) applyRange(minDate, val);
  }

  function setPreset(n: number | 'all') {
    if (n === 'all') {
      setRangeStart('');
      setRangeEnd('');
      dispatch({ type: 'SET_DATE_FILTER', dates: [] });
      return;
    }
    const slice = availableDates.slice(-n);
    if (slice.length === 0) return;
    const start = slice[0];
    const end = slice[slice.length - 1];
    setRangeStart(start);
    setRangeEnd(end);
    dispatch({ type: 'SET_DATE_FILTER', dates: slice });
  }

  function presetIsActive(n: number) {
    if (selectedDates.length !== Math.min(n, availableDates.length)) return false;
    const slice = availableDates.slice(-n);
    return slice[0] === selectedDates[0] && slice[slice.length - 1] === selectedDates[selectedDates.length - 1];
  }

  // Category helpers
  function toggleCategoryGroup(groupCats: string[]) {
    const available = groupCats.filter(c => availableCategories.includes(c));
    const allSelected = available.every(c => selectedCategories.includes(c));
    if (allSelected) {
      dispatch({ type: 'SET_CATEGORY_FILTER', categories: selectedCategories.filter(c => !available.includes(c)) });
    } else {
      dispatch({ type: 'SET_CATEGORY_FILTER', categories: Array.from(new Set([...selectedCategories, ...available])) });
    }
  }

  function groupIsActive(groupCats: string[]) {
    const available = groupCats.filter(c => availableCategories.includes(c));
    return available.length > 0 && available.some(c => selectedCategories.includes(c));
  }

  if (availableDates.length === 0) return null;

  const daysSelected = selectedDates.length;
  const showSummary = daysSelected > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</p>
        {hasFilters && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Date range */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Date Range</p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {(['all', 7, 14] as const).map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                p === 'all'
                  ? daysSelected === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : presetIsActive(p)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'all' ? 'All' : `Last ${p}`}
            </button>
          ))}
        </div>

        {/* Range inputs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 whitespace-nowrap">From</label>
            <input
              type="date"
              value={rangeStart}
              min={minDate}
              max={rangeEnd || maxDate}
              onChange={e => handleStartChange(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <span className="text-gray-300 text-sm">→</span>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 whitespace-nowrap">To</label>
            <input
              type="date"
              value={rangeEnd}
              min={rangeStart || minDate}
              max={maxDate}
              onChange={e => handleEndChange(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {showSummary && (
            <span className="text-xs text-gray-500 ml-1">
              {daysSelected} of {availableDates.length} day{availableDates.length !== 1 ? 's' : ''}
              {daysSelected > 0 && ` · ${fmtDate(selectedDates[0])} – ${fmtDate(selectedDates[daysSelected - 1])}`}
            </span>
          )}
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Category Groups</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_GROUPS).map(([grp, cats]) => (
            <button
              key={grp}
              onClick={() => toggleCategoryGroup(cats)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                groupIsActive(cats)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
