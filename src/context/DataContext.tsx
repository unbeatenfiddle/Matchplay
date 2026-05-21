'use client';

import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from 'react';
import { DailyFile, SalesRow, AppFilters } from '@/types';
import { mergeFiles } from '@/lib/dataStore';
import { parseCSVText, parseCSVFile } from '@/lib/csvParser';
import { loadStoredFiles, addStoredFile } from '@/lib/localStorage';

interface DataState {
  files: DailyFile[];
  allRows: SalesRow[];
  filters: AppFilters;
  loading: boolean;
  uploadErrors: string[];
}

type Action =
  | { type: 'LOAD_PRELOADED'; files: DailyFile[] }
  | { type: 'ADD_UPLOADED_FILES'; files: DailyFile[] }
  | { type: 'SET_DATE_FILTER'; dates: string[] }
  | { type: 'SET_CATEGORY_FILTER'; categories: string[] }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_UPLOAD_ERRORS'; errors: string[] }
  | { type: 'SET_LOADING'; loading: boolean };

function buildAllRows(files: DailyFile[]): SalesRow[] {
  return files.flatMap(f => f.rows);
}

const initialState: DataState = {
  files: [],
  allRows: [],
  filters: { selectedDates: [], selectedCategories: [] },
  loading: true,
  uploadErrors: [],
};

function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case 'LOAD_PRELOADED': {
      const files = mergeFiles(state.files, action.files);
      return { ...state, files, allRows: buildAllRows(files), loading: false };
    }
    case 'ADD_UPLOADED_FILES': {
      const files = mergeFiles(state.files, action.files);
      return { ...state, files, allRows: buildAllRows(files) };
    }
    case 'SET_DATE_FILTER':
      return { ...state, filters: { ...state.filters, selectedDates: action.dates } };
    case 'SET_CATEGORY_FILTER':
      return { ...state, filters: { ...state.filters, selectedCategories: action.categories } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: { selectedDates: [], selectedCategories: [] } };
    case 'SET_UPLOAD_ERRORS':
      return { ...state, uploadErrors: action.errors };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

export interface UploadResult {
  filename: string;
  date: string;
  ok: boolean;
  message?: string;
}

interface DataContextValue {
  state: DataState;
  filteredRows: SalesRow[];
  availableDates: string[];
  availableCategories: string[];
  dispatch: React.Dispatch<Action>;
  uploadFiles: (files: File[]) => Promise<UploadResult[]>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Derive filtered rows
  const filteredRows = useMemo(() => {
    let rows = state.allRows;
    if (state.filters.selectedDates.length > 0) {
      const dateSet = new Set(state.filters.selectedDates);
      rows = rows.filter(r => dateSet.has(r.date));
    }
    if (state.filters.selectedCategories.length > 0) {
      const catSet = new Set(state.filters.selectedCategories);
      rows = rows.filter(r => catSet.has(r.category));
    }
    return rows;
  }, [state.allRows, state.filters]);

  const availableDates = useMemo(
    () => Array.from(new Set(state.allRows.map(r => r.date))).sort(),
    [state.allRows]
  );

  const availableCategories = useMemo(
    () => Array.from(new Set(state.allRows.map(r => r.category))).sort(),
    [state.allRows]
  );

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    const parsed: DailyFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const df = await parseCSVFile(file);
        if (!df.date) throw new Error('Could not extract date from file');
        parsed.push(df);
        const text = await file.text();
        addStoredFile({ filename: file.name, content: btoa(encodeURIComponent(text)), date: df.date });
        results.push({ filename: file.name, date: df.date, ok: true });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Parse error';
        errors.push(`${file.name}: ${message}`);
        results.push({ filename: file.name, date: '', ok: false, message });
      }
    }

    if (parsed.length > 0) dispatch({ type: 'ADD_UPLOADED_FILES', files: parsed });
    dispatch({ type: 'SET_UPLOAD_ERRORS', errors });
    return results;
  }, []);

  // Load preloaded CSVs and restore localStorage uploads on mount
  useEffect(() => {
    async function load() {
      try {
        const manifest = await fetch('/data/manifest.json').then(r => r.json()) as { files: string[] };
        const loaded: DailyFile[] = await Promise.all(
          manifest.files.map(async (name) => {
            const text = await fetch(`/data/${name}`).then(r => r.text());
            return parseCSVText(text, name, 'preloaded');
          })
        );
        dispatch({ type: 'LOAD_PRELOADED', files: loaded });

        // Restore uploaded files from localStorage
        const stored = loadStoredFiles();
        if (stored.length > 0) {
          const restored = await Promise.all(
            stored.map(async (f) => {
              const text = decodeURIComponent(atob(f.content));
              return parseCSVText(text, f.filename, 'uploaded');
            })
          );
          dispatch({ type: 'ADD_UPLOADED_FILES', files: restored });
        }
      } catch (e) {
        console.error('Failed to load data:', e);
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }
    load();
  }, []);

  return (
    <DataContext.Provider value={{ state, filteredRows, availableDates, availableCategories, dispatch, uploadFiles }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
