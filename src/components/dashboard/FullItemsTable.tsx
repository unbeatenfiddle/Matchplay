'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { SalesRow } from '@/types';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

type SortKey = 'date' | 'category' | 'item' | 'quantity' | 'amount';

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);
}

function fmtDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

const PAGE_SIZE = 25;

export function FullItemsTable() {
  const { filteredRows } = useData();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('amount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return filteredRows.filter(r =>
      !q || r.item.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }, [filteredRows, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'quantity') return (a.quantity - b.quantity) * mult;
      if (sortKey === 'amount') return (a.amount - b.amount) * mult;
      const av = a[sortKey as keyof SalesRow] as string;
      const bv = b[sortKey as keyof SalesRow] as string;
      return av.localeCompare(bv) * mult;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalRevOfFiltered = filtered.reduce((s, r) => s + r.amount, 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  }

  function Th({ label, k, align = 'left' }: { label: string; k: SortKey; align?: 'left' | 'right' }) {
    return (
      <th
        className={`py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none text-${align}`}
        onClick={() => toggleSort(k)}
      >
        <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
          {label} <SortIcon k={k} />
        </span>
      </th>
    );
  }

  return (
    <Card>
      <SectionHeader title="All Items" subtitle={`${filtered.length} items · ${fmtUSD(totalRevOfFiltered)} total`} />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items or categories..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <Th label="Date" k="date" />
              <Th label="Category" k="category" />
              <Th label="Item" k="item" />
              <Th label="Qty" k="quantity" align="right" />
              <Th label="Revenue" k="amount" align="right" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-1.5 px-2 text-gray-500 text-xs whitespace-nowrap">{fmtDate(row.date)}</td>
                <td className="py-1.5 px-2 text-gray-500 text-xs">{row.category}</td>
                <td className="py-1.5 px-2 font-medium text-gray-900">{row.item}</td>
                <td className="py-1.5 px-2 text-right text-gray-700">{row.quantity.toLocaleString()}</td>
                <td className="py-1.5 px-2 text-right font-medium text-gray-900">{fmtUSD(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
