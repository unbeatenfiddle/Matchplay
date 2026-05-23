import { WineCostEntry } from '@/types';

const LS_KEY = 'matchplay_uploaded_files';
const LS_COST_KEY = 'matchplay_wine_costs';

interface StoredFile {
  filename: string;
  content: string;
  date: string;
}

export function saveUploadedFiles(files: { filename: string; content: string; date: string }[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(files));
  } catch {
    // localStorage unavailable
  }
}

export function loadStoredFiles(): StoredFile[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredFile[];
  } catch {
    return [];
  }
}

export function addStoredFile(file: StoredFile): void {
  const existing = loadStoredFiles();
  const map = new Map(existing.map(f => [f.date, f]));
  map.set(file.date, file);
  saveUploadedFiles(Array.from(map.values()));
}

export function saveWineCosts(costMap: Record<string, WineCostEntry>): void {
  try {
    localStorage.setItem(LS_COST_KEY, JSON.stringify(costMap));
  } catch {
    // localStorage unavailable or quota exceeded
  }
}

export function loadWineCosts(): Record<string, WineCostEntry> {
  try {
    const raw = localStorage.getItem(LS_COST_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WineCostEntry>;
  } catch {
    return {};
  }
}
