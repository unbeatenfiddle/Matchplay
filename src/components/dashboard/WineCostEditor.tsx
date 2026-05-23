'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { extractWineItems, glsCostPerUnit, WineItemSummary } from '@/lib/costCalc';
import { WineCostEntry } from '@/types';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

const DEFAULT_POUR_OZ = 5;

function fmtUSD(n: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function WineCostEditor() {
  const { state, setWineCost, deleteWineCost } = useData();
  const wineItems = extractWineItems(state.allRows);

  const [rowStates, setRowStates] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const item of wineItems) {
      const existing = state.wineCosts[item.normalizedItem];
      init[item.normalizedItem] = existing ? String(existing.bottleCost) : '';
    }
    return init;
  });

  // Sync inputs if costs are loaded from localStorage after initial render
  useEffect(() => {
    setRowStates(prev => {
      const next = { ...prev };
      for (const item of wineItems) {
        const existing = state.wineCosts[item.normalizedItem];
        if (existing && !prev[item.normalizedItem]) {
          next[item.normalizedItem] = String(existing.bottleCost);
        }
        if (!(item.normalizedItem in prev)) {
          next[item.normalizedItem] = '';
        }
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.wineCosts]);

  function handleChange(normalizedItem: string, value: string) {
    setRowStates(prev => ({ ...prev, [normalizedItem]: value }));
  }

  function handleBlur(item: WineItemSummary) {
    const raw = rowStates[item.normalizedItem] ?? '';
    const bottleCost = parseFloat(raw);

    if (!raw) {
      deleteWineCost(item.normalizedItem);
      return;
    }

    if (!isNaN(bottleCost) && bottleCost > 0) {
      const entry: WineCostEntry = {
        normalizedItem: item.normalizedItem,
        bottleCost,
        pourOz: item.hasGls ? DEFAULT_POUR_OZ : 0,
      };
      setWineCost(entry);
    }
  }

  if (wineItems.length === 0) return null;

  const coveredCount = wineItems.filter(i => !!state.wineCosts[i.normalizedItem]?.bottleCost).length;

  return (
    <Card>
      <SectionHeader
        title="Wine Cost Setup"
        subtitle={`${coveredCount} of ${wineItems.length} wines have costs entered · Glass pours default to ${DEFAULT_POUR_OZ} oz`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-2 pr-4 font-medium">Wine</th>
              <th className="pb-2 pr-4 font-medium text-center">Sells</th>
              <th className="pb-2 pr-4 font-medium text-right">Revenue</th>
              <th className="pb-2 pr-4 font-medium text-right">Bottle Cost</th>
              <th className="pb-2 pr-4 font-medium text-right">Unit Cost</th>
              <th className="pb-2 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {wineItems.map(item => {
              const entry = state.wineCosts[item.normalizedItem];
              const bottleCostStr = rowStates[item.normalizedItem] ?? '';
              const totalRevenue = item.glsRevenue + item.btlRevenue;
              const hasCost = !!entry && entry.bottleCost > 0;
              const unitCost = entry
                ? item.hasGls
                  ? glsCostPerUnit(entry)
                  : entry.bottleCost
                : null;

              return (
                <tr key={item.normalizedItem} className="hover:bg-gray-50/50">
                  <td className="py-2.5 pr-4 font-medium text-gray-800">{item.normalizedItem}</td>
                  <td className="py-2.5 pr-4 text-center">
                    <span className="inline-flex gap-1">
                      {item.hasGls && (
                        <span className="text-xs bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">GLS</span>
                      )}
                      {item.hasBtl && (
                        <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">BTL</span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-gray-600">{fmtUSD(totalRevenue, 0)}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={bottleCostStr}
                        onChange={e => handleChange(item.normalizedItem, e.target.value)}
                        onBlur={() => handleBlur(item)}
                        className="w-20 text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-gray-600">
                    {unitCost !== null && unitCost > 0
                      ? fmtUSD(unitCost)
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="py-2.5 text-center">
                    {hasCost
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      : <AlertCircle className="w-4 h-4 text-amber-400 mx-auto" />
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
